import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Schemas
import { Address, AddressSchema } from './schemas/address.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { ShippingMethod, ShippingMethodSchema } from './schemas/shipping-method.schema';

// Services
import { CheckoutService } from './services/checkout.service';
import { AddressService } from './services/address.service';
import { CouponService } from './services/coupon.service';
import { PaymentService } from './services/payment.service';
import { ShippingService } from './services/shipping.service';

// Payment Integrations
import { StripeService } from './integrations/stripe.service';
import { RazorpayService } from './integrations/razorpay.service';
import { PaypalService } from './integrations/paypal.service';
import { CryptoService } from './integrations/crypto.service';

// Controllers
import { CheckoutController } from './controllers/checkout.controller';
import { AddressController } from './controllers/address.controller';
import { CouponController } from './controllers/coupon.controller';
import { PaymentController } from './controllers/payment.controller';

// Import other modules
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ShippingMethod.name, schema: ShippingMethodSchema },
    ]),
    CartModule,
    ProductModule,
  ],
  controllers: [
    CheckoutController,
    AddressController,
    CouponController,
    PaymentController,
  ],
  providers: [
    CheckoutService,
    AddressService,
    CouponService,
    PaymentService,
    ShippingService,
    StripeService,
    RazorpayService,
    PaypalService,
    CryptoService,
  ],
  exports: [
    CheckoutService,
    AddressService,
    CouponService,
    PaymentService,
    ShippingService,
  ],
})
export class CheckoutModule {}