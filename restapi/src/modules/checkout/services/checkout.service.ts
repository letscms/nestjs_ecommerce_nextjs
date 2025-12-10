import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../schemas/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CartService } from '../../cart/services/cart.service';
import { ProductService } from '../../product/services/product.service';
import { AddressService } from './address.service';
import { ShippingService } from './shipping.service';
import { CouponService } from './coupon.service';
import { PaymentService } from './payment.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
    private productService: ProductService,
    private addressService: AddressService,
    private shippingService: ShippingService,
    private couponService: CouponService,
    private paymentService: PaymentService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const {
      userId,
      sessionId,
      shippingAddressId,
      billingAddressId,
      shippingMethodId,
      paymentMethod,
      couponCode,
      currency = 'USD',
      notes
    } = createOrderDto;

    // Get cart items
    const cart = await this.cartService.getCart(userId, sessionId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate shipping address
    let shippingAddress;
    if (userId) {
      shippingAddress = await this.addressService.findOne(shippingAddressId, userId);
    } else {
      // For guest checkout, you might handle addresses differently
      throw new BadRequestException('Guest checkout requires address validation');
    }

    // Validate billing address (optional)
    let billingAddress;
    if (billingAddressId) {
      if (userId) {
        billingAddress = await this.addressService.findOne(billingAddressId, userId);
      }
    }

    // Validate shipping method
    const shippingMethod = await this.shippingService.findOne(shippingMethodId);

    // Calculate order totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const cartItem of cart.items) {
      // Verify product availability
      const product = await this.productService.findOne(cartItem.productId.toString());
      
      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.name} is no longer available`);
      }

      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const itemPrice = cartItem.salePrice || cartItem.price;
      const itemSubtotal = itemPrice * cartItem.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        name: product.name,
        quantity: cartItem.quantity,
        price: cartItem.price,
        salePrice: cartItem.salePrice,
        sku: product.sku,
        images: product.images
      });
    }

    // Calculate shipping
    const shippingCalculation = await this.shippingService.calculateShipping(
      shippingMethodId,
      subtotal,
      orderItems,
      shippingAddress
    );

    let shippingAmount = shippingCalculation.amount;
    let discountAmount = 0;
    let appliedCouponId: Types.ObjectId | undefined;

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await this.couponService.applyCoupon({
        couponCode,
        userId,
        sessionId,
        orderTotal: subtotal + shippingAmount,
        currency
      });

      if (couponResult.valid && couponResult.coupon) {
        discountAmount = couponResult.discount;
        appliedCouponId = couponResult.coupon._id as Types.ObjectId;

        // If it's a free shipping coupon, set shipping to 0
        if (couponResult.coupon.type === 'free_shipping') {
          shippingAmount = 0;
        }
      } else {
        throw new BadRequestException(couponResult.message);
      }
    }

    const totalAmount = subtotal + shippingAmount - discountAmount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = new this.orderModel({
      orderNumber,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      sessionId,
      items: orderItems,
      shippingAddress: new Types.ObjectId(shippingAddressId),
      billingAddress: billingAddressId ? new Types.ObjectId(billingAddressId) : undefined,
      shippingMethod: new Types.ObjectId(shippingMethodId),
      subtotal,
      shippingAmount,
      discountAmount,
      totalAmount,
      currency,
      paymentMethod,
      appliedCoupon: appliedCouponId,
      couponCode,
      notes,
      status: OrderStatus.PENDING
    });

    const savedOrder = await order.save();

    // Reserve inventory
    for (const item of orderItems) {
      await this.productService.updateStock(item.productId.toString(), -item.quantity);
    }

    // Increment coupon usage
    if (appliedCouponId) {
      await this.couponService.incrementUsage(appliedCouponId.toString());
    }

    // Clear cart
    if (cart._id) {
      await this.cartService.clearCart(cart._id.toString(), userId, sessionId);
    }

    return savedOrder;
  }

  async findUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: OrderDocument[], total: number, totalPages: number }> {
    const skip = (page - 1) * limit;

    const orders = await this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('shippingAddress')
      .populate('billingAddress')
      .populate('shippingMethod')
      .populate('appliedCoupon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.orderModel.countDocuments({ 
      userId: new Types.ObjectId(userId) 
    });

    return {
      orders,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string, userId?: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const filter: any = { _id: new Types.ObjectId(id) };
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel
      .findOne(filter)
      .populate('shippingAddress')
      .populate('billingAddress')
      .populate('shippingMethod')
      .populate('appliedCoupon')
      .populate({
        path: 'items.productId',
        select: 'name images'
      })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string, userId?: string): Promise<OrderDocument> {
    const filter: any = { orderNumber };
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel
      .findOne(filter)
      .populate('shippingAddress')
      .populate('billingAddress')
      .populate('shippingMethod')
      .populate('appliedCoupon')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<OrderDocument> {
    const updateData: any = { status };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(orderId: string, userId?: string): Promise<OrderDocument> {
    const filter: any = { _id: new Types.ObjectId(orderId) };
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(filter);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    // Restore inventory
    for (const item of order.items) {
      await this.productService.updateStock(item.productId.toString(), item.quantity);
    }

    order.status = OrderStatus.CANCELLED;
    return await order.save();
  }

  async getOrderSummary(userId?: string, sessionId?: string): Promise<any> {
    const cart = await this.cartService.getCartSummary(userId, sessionId);
    
    if (cart.totalItems === 0) {
      return {
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: 0
      };
    }

    // This would include shipping calculations, tax calculations, etc.
    const subtotal = cart.totalAmount;
    const shipping = 0; // Calculate based on selected shipping method
    const tax = subtotal * 0.1; // Example tax calculation
    const discount = 0; // Calculate based on applied coupon

    return {
      items: cart.items,
      subtotal,
      shipping,
      tax,
      discount,
      total: subtotal + shipping + tax - discount
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Get count of orders today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const todayOrderCount = await this.orderModel.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    const sequence = (todayOrderCount + 1).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${sequence}`;
  }
}