import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGatewayInterface, PaymentResult, RefundResult } from '../interfaces/payment-gateway.interface';

const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService implements PaymentGatewayInterface {
  private razorpay: any;

  constructor(private configService: ConfigService) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<any> {
    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency.toUpperCase(),
        notes: metadata || {},
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error) {
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentId: string, paymentMethodId: string): Promise<PaymentResult> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        success: payment.status === 'captured',
        paymentId: payment.id,
        transactionId: payment.id,
        status: payment.status === 'captured' ? 'completed' : 'pending',
        amount: payment.amount / 100,
        currency: payment.currency,
        gatewayResponse: payment,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        amount: 0,
        currency: '',
        errorMessage: error.message,
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    try {
      const refundData: any = { payment_id: paymentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: 'completed',
      };
    } catch (error) {
      return {
        success: false,
        amount: amount || 0,
        status: 'failed',
        errorMessage: error.message,
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return {
        status: payment.status,
        amount: payment.amount / 100,
        currency: payment.currency,
      };
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }
}