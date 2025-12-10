import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as paypal from 'paypal-rest-sdk';
import { PaymentGatewayInterface, PaymentResult, RefundResult } from '../interfaces/payment-gateway.interface';

@Injectable()
export class PaypalService implements PaymentGatewayInterface {
  constructor(private configService: ConfigService) {
    paypal.configure({
      mode: this.configService.get('PAYPAL_MODE') || 'sandbox',
      client_id: this.configService.get('PAYPAL_CLIENT_ID') || '',
      client_secret: this.configService.get('PAYPAL_CLIENT_SECRET') || '',
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: this.configService.get('PAYPAL_RETURN_URL'),
          cancel_url: this.configService.get('PAYPAL_CANCEL_URL'),
        },
        transactions: [
          {
            item_list: {
              items: [],
            },
            amount: {
              currency: currency.toUpperCase(),
              total: amount.toFixed(2),
            },
            description: 'Order payment',
          },
        ],
      };

      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          reject(new Error(`PayPal payment creation failed: ${error.message}`));
        } else {
          const approvalUrl = payment.links?.find(link => link.rel === 'approval_url');
          resolve({
            paymentId: payment.id,
            approvalUrl: approvalUrl?.href,
          });
        }
      });
    });
  }

  async confirmPayment(paymentId: string, payerId: string): Promise<PaymentResult> {
    return new Promise((resolve) => {
      const execute_payment_json = {
        payer_id: payerId,
      };

      paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
          resolve({
            success: false,
            status: 'failed',
            amount: 0,
            currency: '',
            errorMessage: error.message,
          });
        } else {
          const transaction = payment.transactions[0];
          resolve({
            success: payment.state === 'approved',
            paymentId: payment.id,
            transactionId: transaction.related_resources?.[0]?.sale?.id,
            status: payment.state === 'approved' ? 'completed' : 'pending',
            amount: parseFloat(transaction.amount.total),
            currency: transaction.amount.currency,
            gatewayResponse: payment,
          });
        }
      });
    });
  }

  async refundPayment(saleId: string, amount?: number): Promise<RefundResult> {
    return new Promise((resolve) => {
      const refund_json: any = {};
      if (amount) {
        refund_json.amount = {
          total: amount.toFixed(2),
          currency: 'USD', // You might want to pass currency as parameter
        };
      }

      paypal.sale.refund(saleId, refund_json, (error, refund) => {
        if (error) {
          resolve({
            success: false,
            amount: amount || 0,
            status: 'failed',
            errorMessage: error.message,
          });
        } else {
          resolve({
            success: true,
            refundId: refund.id,
            amount: parseFloat(refund.amount.total),
            status: 'completed',
          });
        }
      });
    });
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      paypal.payment.get(paymentId, (error, payment) => {
        if (error) {
          reject(new Error(`Failed to get payment status: ${error.message}`));
        } else {
          resolve({
            status: payment.state,
            amount: parseFloat(payment.transactions[0].amount.total),
            currency: payment.transactions[0].amount.currency,
          });
        }
      });
    });
  }
}