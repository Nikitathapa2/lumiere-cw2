import Stripe from 'stripe';
import { env } from '../config/env.js';

export const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

export const isStripeEnabled = Boolean(stripe);
