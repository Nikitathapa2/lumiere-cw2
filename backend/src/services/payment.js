import { env } from '../config/env.js';


export async function createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
  if (env.stripeSecretKey) {
  }

  return {
    id: `mock_pi_${Date.now().toString(36)}`,
    clientSecret: null,
    status: 'requires_payment_method',
    mock: true,
  };
}
