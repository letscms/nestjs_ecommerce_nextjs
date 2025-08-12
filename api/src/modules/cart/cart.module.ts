import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './services/cart.service';
import { WishlistService } from './services/wishlist.service';
import { CartController } from './controllers/cart.controller';
import { WishlistController } from './controllers/wishlist.controller';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Wishlist.name, schema: WishlistSchema },
    ]),
    ProductModule, // Import to access ProductService
  ],
  controllers: [
    CartController, 
    WishlistController
  ],
  providers: [
    CartService, 
    WishlistService
  ],
  exports: [
    CartService, 
    WishlistService
  ],
})
export class CartModule {}