import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentIntentDto } from '../dto/payment-intent.dto';
import { PaymentMethod } from '../dto/create-order.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  @HttpCode(HttpStatus.OK)
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(
      createPaymentIntentDto.orderId,
      createPaymentIntentDto.amount,
      createPaymentIntentDto.currency,
      createPaymentIntentDto.paymentMethod,
      createPaymentIntentDto.metadata
    );
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  processPayment(@Body() paymentData: {
    orderId: string;
    paymentMethod: PaymentMethod;
    paymentDetails: any;
  }) {
    return this.paymentService.processPayment(
      paymentData.orderId,
      paymentData.paymentMethod,
      paymentData.paymentDetails
    );
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  refundPayment(@Body() refundData: {
    paymentId: string;
    amount?: number;
  }) {
    return this.paymentService.refundPayment(
      refundData.paymentId,
      refundData.amount
    );
  }

  @Get('history/:orderId')
  getPaymentHistory(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentHistory(orderId);
  }

  @Get('status/:paymentId')
  getPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPaymentStatus(paymentId);
  }

  @Get('currencies/:paymentMethod')
  getSupportedCurrencies(@Param('paymentMethod') paymentMethod: PaymentMethod) {
    return this.paymentService.getSupportedCurrencies(paymentMethod);
  }

  @Get('convert')
  convertCurrency(
    @Query('amount') amount: number,
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string
  ) {
    return this.paymentService.convertCurrency(amount, fromCurrency, toCurrency);
  }
}