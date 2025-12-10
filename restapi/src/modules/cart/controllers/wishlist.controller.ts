import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { WishlistService } from '../services/wishlist.service';
import { AddToWishlistDto } from '../dto/add-to-wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addToWishlist(@Body() addToWishlistDto: AddToWishlistDto) {
    return await this.wishlistService.addToWishlist(addToWishlistDto);
  }

  @Get(':userId')
  async getWishlist(@Param('userId') userId: string) {
    return await this.wishlistService.getWishlist(userId);
  }

  @Get(':userId/summary')
  async getWishlistSummary(@Param('userId') userId: string) {
    return await this.wishlistService.getWishlistSummary(userId);
  }

  @Get(':userId/check/:productId')
  async isInWishlist(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string
  ) {
    const isInWishlist = await this.wishlistService.isInWishlist(userId, productId, variantId);
    return { isInWishlist };
  }

  @Delete(':userId/items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromWishlist(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string
  ) {
    await this.wishlistService.removeFromWishlist(userId, productId, variantId);
  }

  @Delete(':userId/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearWishlist(@Param('userId') userId: string) {
    await this.wishlistService.clearWishlist(userId);
  }

  @Post(':userId/move-to-cart/:productId')
  @HttpCode(HttpStatus.OK)
  async moveToCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string
  ) {
    return await this.wishlistService.moveToCart(userId, productId, variantId);
  }
}