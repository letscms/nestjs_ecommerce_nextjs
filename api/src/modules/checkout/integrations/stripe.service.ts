import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentGatewayInterface, PaymentResult, RefundResult } from '../interfaces/payment-gateway.interface';

@Injectable()
export class StripeService implements PaymentGatewayInterface {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-05-28.basil',
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        expand: ['charges'],
      }) as unknown as Stripe.PaymentIntent & { charges: Stripe.ApiList<Stripe.Charge> };

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        transactionId: paymentIntent.charges?.data?.[0]?.id,
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        gatewayResponse: paymentIntent,
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
      const refundData: any = { payment_intent: paymentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status === 'succeeded' ? 'completed' : 'pending',
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
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
      };
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }
}