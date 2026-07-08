import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function createTransporter() {
  if (!env.smtpHost || !env.smtpUser) return null;
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
}

const transporter = createTransporter();

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`[email] (no SMTP configured — logging to console)`);
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body: ${text || html}`);
    return;
  }
  await transporter.sendMail({
    from: `"LUMIÈRE" <${env.emailFrom}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  await sendMail({
    to,
    subject: 'Reset your LUMIÈRE password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="font-size:22px;margin-bottom:12px;">Reset your password</h2>
        <p style="color:#4A4A4A;line-height:1.6;">
          We received a request to reset the password for your LUMIÈRE account.
          Click the button below to choose a new password. This link expires in 15 minutes.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 28px;background:#000;color:#fff;text-decoration:none;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">
          Reset Password
        </a>
        <p style="color:#8A8A8A;font-size:12px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #E4E2DE;margin:24px 0;" />
        <p style="color:#8A8A8A;font-size:11px;">LUMIÈRE &mdash; Conscious Luxury, Defined by Hand.</p>
      </div>
    `,
    text: `Reset your LUMIÈRE password\n\nClick the link below to reset your password (expires in 15 minutes):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  });
}

export async function sendSecurityAlertEmail({ alert }) {
  const to = env.alertEmail;
  if (!to) return;
  const severityColor = alert.severity === 'CRITICAL' ? '#dc2626' : alert.severity === 'HIGH' ? '#ea580c' : '#ca8a04';
  await sendMail({
    to,
    subject: `[SECURITY ${alert.severity}] ${alert.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;">
        <div style="background:${severityColor};color:#fff;padding:12px 20px;font-size:13px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;">
          ${alert.severity} — ${alert.rule}
        </div>
        <div style="padding:20px;border:1px solid #E4E2DE;">
          <h2 style="margin:0 0 12px;font-size:18px;color:#111;">${alert.title}</h2>
          <pre style="background:#f4f3f1;padding:12px;font-size:12px;overflow:auto;border:1px solid #E4E2DE;">${JSON.stringify(alert.meta, null, 2)}</pre>
        </div>
        <p style="color:#8A8A8A;font-size:11px;padding:12px 0;">LUMIÈRE &mdash; Automated Security Alert</p>
      </div>
    `,
    text: `[SECURITY ${alert.severity}] ${alert.rule}\n\n${alert.title}\n\n${JSON.stringify(alert.meta, null, 2)}`,
  });
}

export async function sendOrderConfirmationEmail({ to, orderNumber, total }) {
  await sendMail({
    to,
    subject: `Order Confirmed — ${orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="font-size:22px;margin-bottom:12px;">Thank you for your order!</h2>
        <p style="color:#4A4A4A;line-height:1.6;">
          Your order <strong>${orderNumber}</strong> has been placed successfully.
          Total: <strong>$${total.toFixed(2)}</strong>.
        </p>
        <p style="color:#8A8A8A;font-size:12px;">We'll notify you when it ships.</p>
        <hr style="border:none;border-top:1px solid #E4E2DE;margin:24px 0;" />
        <p style="color:#8A8A8A;font-size:11px;">LUMIÈRE &mdash; Conscious Luxury, Defined by Hand.</p>
      </div>
    `,
    text: `Order confirmed: ${orderNumber}. Total: $${total.toFixed(2)}.`,
  });
}
