import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaymentMethod } from '../dto/create-order.dto';
import { StripeService } from '../integrations/stripe.service';
import { RazorpayService } from '../integrations/razorpay.service';
import { PaypalService } from '../integrations/paypal.service';
import { CryptoService } from '../integrations/crypto.service';
import { PaymentGatewayInterface, PaymentResult } from '../interfaces/payment-gateway.interface';

@Injectable()
export class PaymentService {
  private gateways: Map<PaymentMethod, PaymentGatewayInterface>;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private stripeService: StripeService,
    private razorpayService: RazorpayService,
    private paypalService: PaypalService,
    private cryptoService: CryptoService,
  ) {
    this.gateways = new Map<PaymentMethod, PaymentGatewayInterface>([
      [PaymentMethod.STRIPE, this.stripeService],
      [PaymentMethod.RAZORPAY, this.razorpayService],
      [PaymentMethod.PAYPAL, this.paypalService],
      [PaymentMethod.CRYPTO, this.cryptoService],
    ]);
  }

  async createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string,
    paymentMethod: PaymentMethod,
    metadata?: any
  ): Promise<any> {
    if (paymentMethod === PaymentMethod.COD) {
      // Cash on Delivery doesn't need payment intent
      return {
        paymentMethod: 'cod',
        message: 'Cash on Delivery selected'
      };
    }

    const gateway = this.gateways.get(paymentMethod);
    if (!gateway) {
      throw new BadRequestException(`Unsupported payment method: ${paymentMethod}`);
    }

    try {
      const paymentIntent = await gateway.createPaymentIntent(
        amount,
        currency,
        { orderId, ...metadata }
      );

      // Save payment record
      const payment = new this.paymentModel({
        orderId,
        gateway: paymentMethod,
        amount,
        currency,
        status: 'pending',
        metadata: paymentIntent
      });

      await payment.save();

      return paymentIntent;
    } catch (error) {
      throw new BadRequestException(`Payment intent creation failed: ${error.message}`);
    }
  }

  async processPayment(
    orderId: string,
    paymentMethod: PaymentMethod,
    paymentDetails: any
  ): Promise<PaymentResult> {
    if (paymentMethod === PaymentMethod.COD) {
      // Handle Cash on Delivery
      const payment = new this.paymentModel({
        orderId,
        gateway: paymentMethod,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: 'completed',
        paymentId: `cod_${Date.now()}`,
        metadata: { type: 'cash_on_delivery' }
      });

      await payment.save();

      return {
        success: true,
        paymentId: payment.paymentId,
        status: 'completed',
        amount: paymentDetails.amount,
        currency: paymentDetails.currency
      };
    }

    const gateway = this.gateways.get(paymentMethod);
    if (!gateway) {
      throw new BadRequestException(`Unsupported payment method: ${paymentMethod}`);
    }

    try {
      const result = await gateway.confirmPayment(
        paymentDetails.paymentIntentId || paymentDetails.paymentId,
        paymentDetails.paymentMethodId || paymentDetails.payerId
      );

      // Update payment record
      await this.paymentModel.findOneAndUpdate(
        { orderId },
        {
          status: result.status,
          paymentId: result.paymentId,
          transactionId: result.transactionId,
          gatewayResponse: result.gatewayResponse,
          failureReason: result.errorMessage
        }
      );

      return result;
    } catch (error) {
      // Save failed payment
      await this.paymentModel.findOneAndUpdate(
        { orderId },
        {
          status: 'failed',
          failureReason: error.message
        }
      );

      throw new BadRequestException(`Payment processing failed: ${error.message}`);
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<any> {
    const payment = await this.paymentModel.findOne({ paymentId });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.gateway === PaymentMethod.COD) {
      throw new BadRequestException('Cannot refund Cash on Delivery payments through system');
    }

    const gateway = this.gateways.get(payment.gateway);
    if (!gateway) {
      throw new BadRequestException(`Unsupported payment method: ${payment.gateway}`);
    }

    try {
      if (!payment.paymentId) {
        throw new BadRequestException('Payment ID not found for refund');
      }

      const refundResult = await gateway.refundPayment(payment.paymentId, amount);

      // Create refund record
      const refundPayment = new this.paymentModel({
        orderId: payment.orderId,
        gateway: payment.gateway,
        type: amount ? 'partial_refund' : 'refund',
        amount: refundResult.amount,
        currency: payment.currency,
        status: refundResult.status,
        refundId: refundResult.refundId,
        metadata: { originalPaymentId: paymentId }
      });

      await refundPayment.save();

      return refundResult;
    } catch (error) {
      throw new BadRequestException(`Refund failed: ${error.message}`);
    }
  }

  async getPaymentHistory(orderId: string): Promise<Payment[]> {
    return await this.paymentModel
      .find({ orderId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    const payment = await this.paymentModel.findOne({ paymentId });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.gateway === PaymentMethod.COD) {
      return {
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      };
    }

    const gateway = this.gateways.get(payment.gateway);
    if (!gateway) {
      throw new BadRequestException(`Unsupported payment method: ${payment.gateway}`);
    }

    try {
      return await gateway.getPaymentStatus(paymentId);
    } catch (error) {
      throw new BadRequestException(`Failed to get payment status: ${error.message}`);
    }
  }

  async getSupportedCurrencies(paymentMethod: PaymentMethod): Promise<string[]> {
    // Return supported currencies for each payment method
    const currencyMap = {
      [PaymentMethod.STRIPE]: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'],
      [PaymentMethod.RAZORPAY]: ['INR'],
      [PaymentMethod.PAYPAL]: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      [PaymentMethod.COD]: ['USD', 'EUR', 'GBP', 'INR'], // Based on your supported regions
      [PaymentMethod.CRYPTO]: ['BTC', 'ETH', 'USD', 'EUR']
    };

    return currencyMap[paymentMethod] || ['USD'];
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    // This is a simplified example - you would integrate with a real currency conversion API
    // like Fixer.io, CurrencyAPI, or similar
    
    const exchangeRates = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'INR': 83.12,
      'CAD': 1.35,
      'AUD': 1.52,
      'JPY': 149.50
    };

    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;

    return (amount / fromRate) * toRate;
  }
}