import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET'];

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumiere',
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/oauth/google/callback',
  oauthStateSecret: process.env.OAUTH_STATE_SECRET || 'dev-oauth-state-secret-change-me',
  get googleOAuthEnabled() {
    return Boolean(this.googleClientId && this.googleClientSecret);
  },
  csrfSecret: process.env.CSRF_SECRET || 'dev-csrf-secret-change-me',
  orderAccessSecret: process.env.ORDER_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-order-access-secret-change-me',
  mfaEncryptionKey: process.env.MFA_ENCRYPTION_KEY || '',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  allowMockCheckout: process.env.ALLOW_MOCK_CHECKOUT === 'true',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@lumiere.store',
  alertEmail: process.env.ALERT_EMAIL || '',
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL || '',
};

if (env.isProd) {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
