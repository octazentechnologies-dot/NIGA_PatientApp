declare module 'react-native-razorpay' {
  export type RazorpayCheckoutOptions = {
    key: string;
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    order_id: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: { color?: string };
  };

  export type RazorpaySuccess = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  export type RazorpayError = {
    code?: number | string;
    description?: string;
    error?: {
      code?: string;
      description?: string;
      reason?: string;
      source?: string;
      step?: string;
    };
  };

  const RazorpayCheckout: {
    open: (options: RazorpayCheckoutOptions) => Promise<RazorpaySuccess>;
  };

  export default RazorpayCheckout;
}
