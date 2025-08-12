import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  BadRequestException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Handle session for guest users
    if (!addToCartDto.userId && !addToCartDto.sessionId) {
      let sessionId = req.cookies?.['cart_session'];
      if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('cart_session', sessionId, { 
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          httpOnly: true 
        });
      }
      addToCartDto.sessionId = sessionId;
    }

    const cart = await this.cartService.addToCart(addToCartDto);
    return res.json(cart);
  }

  @Get()
  async getCart(
    @Req() req: Request,
    @Query('userId') userId?: string
  ) {
    const sessionId = req.cookies?.['cart_session'];
    return await this.cartService.getCart(userId, sessionId);
  }

  @Get('summary')
  async getCartSummary(
    @Req() req: Request,
    @Query('userId') userId?: string
  ) {
    const sessionId = req.cookies?.['cart_session'];
    return await this.cartService.getCartSummary(userId, sessionId);
  }

  @Patch(':cartId/items/:itemId')
  async updateCartItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Body() updateDto: UpdateCartItemDto
  ) {
    if (!updateDto.userId && !updateDto.sessionId) {
      updateDto.sessionId = req.cookies?.['cart_session'];
    }

    return await this.cartService.updateCartItem(cartId, itemId, updateDto);
  }

  @Delete(':cartId/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromCart(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Query('userId') userId?: string
  ) {
    const sessionId = req.cookies?.['cart_session'];
    await this.cartService.removeFromCart(cartId, itemId, userId, sessionId);
  }

  @Delete(':cartId/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(
    @Param('cartId') cartId: string,
    @Req() req: Request,
    @Query('userId') userId?: string
  ) {
    const sessionId = req.cookies?.['cart_session'];
    await this.cartService.clearCart(cartId, userId, sessionId);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  async mergeCarts(
    @Req() req: Request,
    @Body('userId') userId: string
  ) {
    const guestSessionId = req.cookies?.['cart_session'];
    if (!guestSessionId) {
      throw new BadRequestException('No guest cart found');
    }

    return await this.cartService.mergeCarts(guestSessionId, userId);
  }
}