import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { ProductService } from '../../product/services/product.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productService: ProductService,
  ) {}

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity, variantId, userId, sessionId } = addToCartDto;

    // Validate product exists
    const product = await this.productService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check stock availability
    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Find or create cart
    let cart = await this.findCart(userId, sessionId);
    
    if (!cart) {
      cart = await this.createCart(userId, sessionId);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      (!variantId || item.variantId?.toString() === variantId)
    );

    const price = product.salePrice || product.price;

    if (existingItemIndex > -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check total stock
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      const newItem = {
        productId: new Types.ObjectId(productId),
        variantId: variantId ? new Types.ObjectId(variantId) : undefined,
        quantity,
        price,
        salePrice: product.salePrice
      };

      cart.items.push(newItem);
    }

    // Update cart totals
    await this.updateCartTotals(cart);
    cart.lastActivity = new Date();
    cart.isActive = true;

    return await cart.save();
  }

  async updateCartItem(cartId: string, itemId: string, updateDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Validate ownership
    if (updateDto.userId && cart.userId?.toString() !== updateDto.userId) {
      throw new BadRequestException('Unauthorized');
    }
    if (updateDto.sessionId && cart.sessionId !== updateDto.sessionId) {
      throw new BadRequestException('Unauthorized');
    }

    const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId);
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    const item = cart.items[itemIndex];
    const product = await this.productService.findOne(item.productId.toString());

    // Check stock availability
    if (product.stock < updateDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    cart.items[itemIndex].quantity = updateDto.quantity;
    await this.updateCartTotals(cart);
    cart.lastActivity = new Date();

    return await cart.save();
  }

  async removeFromCart(cartId: string, itemId: string, userId?: string, sessionId?: string): Promise<Cart> {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Validate ownership
    if (userId && cart.userId?.toString() !== userId) {
      throw new BadRequestException('Unauthorized');
    }
    if (sessionId && cart.sessionId !== sessionId) {
      throw new BadRequestException('Unauthorized');
    }

    cart.items = cart.items.filter(item => item._id?.toString() !== itemId);
    await this.updateCartTotals(cart);
    cart.lastActivity = new Date();

    return await cart.save();
  }

  async getCart(userId?: string, sessionId?: string): Promise<Cart | null> {
    const cart = await this.findCart(userId, sessionId);
    if (cart) {
      await cart.populate([
        { path: 'items.productId', select: 'name price salePrice images stock' },
        { path: 'items.variantId', select: 'name price attributes images' }
      ]);
    }
    return cart;
  }

  async clearCart(cartId: string, userId?: string, sessionId?: string): Promise<void> {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Validate ownership
    if (userId && cart.userId?.toString() !== userId) {
      throw new BadRequestException('Unauthorized');
    }
    if (sessionId && cart.sessionId !== sessionId) {
      throw new BadRequestException('Unauthorized');
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;
    cart.lastActivity = new Date();

    await cart.save();
  }

  async mergeCarts(guestSessionId: string, userId: string): Promise<Cart> {
    // Find guest cart
    const guestCart = await this.cartModel.findOne({ sessionId: guestSessionId });
    
    // Find or create user cart
    let userCart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    
    if (!userCart) {
      userCart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
        totalItems: 0,
        lastActivity: new Date(),
        isActive: true
      });
    }

    if (guestCart && guestCart.items.length > 0) {
      // Merge items from guest cart to user cart
      for (const guestItem of guestCart.items) {
        const existingItemIndex = userCart.items.findIndex(item => 
          item.productId.toString() === guestItem.productId.toString() && 
          (!guestItem.variantId || item.variantId?.toString() === guestItem.variantId?.toString())
        );

        if (existingItemIndex > -1) {
          // Update quantity
          userCart.items[existingItemIndex].quantity += guestItem.quantity;
        } else {
          // Add new item
          userCart.items.push(guestItem);
        }
      }

      // Delete guest cart
      await this.cartModel.findByIdAndDelete(guestCart._id);
    }

    await this.updateCartTotals(userCart);
    userCart.lastActivity = new Date();
    userCart.isActive = true;

    return await userCart.save();
  }

  async getCartSummary(userId?: string, sessionId?: string): Promise<any> {
    const cart = await this.getCart(userId, sessionId);
    
    if (!cart) {
      return {
        totalItems: 0,
        totalAmount: 0,
        items: []
      };
    }

    return {
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      items: cart.items.map(item => ({
        id: item._id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        salePrice: item.salePrice,
        subtotal: (item.salePrice || item.price) * item.quantity
      }))
    };
  }

  private async findCart(userId?: string, sessionId?: string): Promise<CartDocument | null> {
    if (userId) {
      return await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    } else if (sessionId) {
      return await this.cartModel.findOne({ sessionId });
    }
    return null;
  }

  private async createCart(userId?: string, sessionId?: string): Promise<CartDocument> {
    const cartData: any = {
      items: [],
      totalAmount: 0,
      totalItems: 0,
      lastActivity: new Date(),
      isActive: true
    };

    if (userId) {
      cartData.userId = new Types.ObjectId(userId);
    } else {
      cartData.sessionId = sessionId || uuidv4();
    }

    const cart = new this.cartModel(cartData);
    return await cart.save();
  }

  private async updateCartTotals(cart: CartDocument): Promise<void> {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => {
      const price = item.salePrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  }

  // Cleanup old guest carts (run as scheduled job)
  async cleanupInactiveCarts(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.cartModel.deleteMany({
      sessionId: { $exists: true },
      lastActivity: { $lt: thirtyDaysAgo }
    });
  }
}