export interface PaymentGatewayInterface {
  createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<any>;
  confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<any>;
  refundPayment(paymentId: string, amount?: number): Promise<any>;
  getPaymentStatus(paymentId: string): Promise<any>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  gatewayResponse?: any;
  errorMessage?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
}