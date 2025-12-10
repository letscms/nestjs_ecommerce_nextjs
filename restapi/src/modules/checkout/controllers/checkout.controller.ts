import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { CheckoutService } from '../services/checkout.service';
import { ShippingService } from '../services/shipping.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '../schemas/order.schema';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly shippingService: ShippingService,
  ) {}

  @Get('summary')
  getOrderSummary(
    @Query('userId') userId?: string,
    @Req() req?: Request
  ) {
    const sessionId = req?.cookies?.['cart_session'];
    return this.checkoutService.getOrderSummary(userId, sessionId);
  }

  @Get('shipping-methods')
  getShippingMethods(
    @Query('orderTotal') orderTotal: number,
    @Query('country') country?: string
  ) {
    return this.shippingService.getAvailableShippingMethods(orderTotal, country);
  }

  @Post('create-order')
  @HttpCode(HttpStatus.CREATED)
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.checkoutService.createOrder(createOrderDto);
  }

  @Get('orders/user/:userId')
  getUserOrders(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.checkoutService.findUserOrders(userId, page, limit);
  }

  @Get('orders/:id')
  getOrder(
    @Param('id') id: string,
    @Query('userId') userId?: string
  ) {
    return this.checkoutService.findOne(id, userId);
  }

  @Get('orders/number/:orderNumber')
  getOrderByNumber(
    @Param('orderNumber') orderNumber: string,
    @Query('userId') userId?: string
  ) {
    return this.checkoutService.findByOrderNumber(orderNumber, userId);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateData: {
      status: OrderStatus;
      trackingNumber?: string;
    }
  ) {
    return this.checkoutService.updateOrderStatus(
      id,
      updateData.status,
      updateData.trackingNumber
    );
  }

  @Patch('orders/:id/cancel')
  cancelOrder(
    @Param('id') id: string,
    @Query('userId') userId?: string
  ) {
    return this.checkoutService.cancelOrder(id, userId);
  }
}