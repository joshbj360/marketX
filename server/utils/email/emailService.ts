// server/utils/email/emailService.ts
/**
 * Email Service
 * Handles all email sending via Resend
 */

import { Resend } from 'resend'

let resendInstance: Resend | null = null

/**
 * Get Resend instance (singleton)
 */
function getResendClient(): Resend {
  if (!resendInstance) {
    const config = useRuntimeConfig()
    const apiKey = config.resendApiKey

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    resendInstance = new Resend(apiKey)
  }

  return resendInstance
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

/**
 * Send email via Resend
 */
export async function sendEmail(
  options: EmailOptions,
): Promise<{ id: string }> {
  const resend = getResendClient()
  const config = useRuntimeConfig()
  const senderEmail = config.public.senderEmail as string

  try {
    const response = await resend.emails.send({
      from: senderEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    if (response.error) {
      throw new Error(response.error.message)
    }

    return { id: response.data?.id || '' }
  } catch (error: any) {
    console.error('Failed to send email:', error.message)
    throw error
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  appUrl: string,
  appName?: string,
): Promise<{ id: string }> {
  const verificationLink = `${appUrl}/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #333; margin: 0; }
          .content { margin: 20px 0; line-height: 1.6; color: #555; }
          .button { display: inline-block; padding: 12px 30px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          
          <div class="content">
            <p>Welcome to ${appName}! Please verify your email address to complete your registration.</p>
            
            <p>Click the button below to verify your email:</p>
            
            <a href="${verificationLink}" class="button">Verify Email</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p><small>${verificationLink}</small></p>
            
            <p>This link will expire in 24 hours.</p>
            
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 ReelCart. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Verify your email address',
    html,
    text: `Verify your email: ${verificationLink}`,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  appUrl: string = 'http://localhost:3000',
  appName?: string,
): Promise<{ id: string }> {
  const resetLink = `${appUrl}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #333; margin: 0; }
          .content { margin: 20px 0; line-height: 1.6; color: #555; }
          .button { display: inline-block; padding: 12px 30px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          
          <div class="content">
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p><small>${resetLink}</small></p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 15 minutes. If you didn't request this, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>For security reasons, never share this link with anyone.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 ReelCart. All rights reserved. ${{ appName }} </p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html,
    text: `Reset your password: ${resetLink}`,
  })
}

/**
 * Send checkout OTP email
 */
export async function sendOtpEmail(
  email: string,
  code: string,
  isNewUser: boolean,
  appName = 'MarketX',
): Promise<{ id: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
          .header { background: #e31837; padding: 28px 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 22px; }
          .body { padding: 32px; }
          .otp { display: block; font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #e31837; text-align: center; margin: 24px 0; }
          .note { font-size: 13px; color: #888; text-align: center; margin-top: 8px; }
          .footer { text-align: center; padding: 16px; font-size: 12px; color: #aaa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>${appName}</h1></div>
          <div class="body">
            <p style="color:#333;font-size:15px;margin:0 0 8px;">
              ${isNewUser ? 'Welcome! Use the code below to verify your email and complete your order.' : 'Use the code below to confirm your identity and complete your order.'}
            </p>
            <span class="otp">${code}</span>
            <p class="note">This code expires in <strong>10 minutes</strong> and can only be used once.</p>
            <p class="note" style="margin-top:16px;">If you didn't attempt to check out on ${appName}, you can safely ignore this email.</p>
          </div>
          <div class="footer">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `${code} is your ${appName} verification code`,
    html,
    text: `Your ${appName} verification code is: ${code}\n\nExpires in 10 minutes.`,
  })
}

// ─── Notification email builders ─────────────────────────────────────────────
// These return { subject, html, text } ready to pass to emailQueue.enqueue().

export function buildOrderStatusEmail(
  orderId: number,
  status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  options: { trackingNumber?: string; shipper?: string; appName?: string } = {},
): { subject: string; html: string; text: string } {
  const { trackingNumber, shipper, appName = 'MarketX' } = options
  const info: Record<
    string,
    { emoji: string; headline: string; detail: string }
  > = {
    CONFIRMED: {
      emoji: '✅',
      headline: 'Order confirmed',
      detail:
        'The seller has confirmed your order and is preparing it for shipment.',
    },
    SHIPPED: {
      emoji: '📦',
      headline: 'Order shipped',
      detail: `Your order has been shipped${trackingNumber ? ` · Tracking: ${trackingNumber}${shipper ? ` via ${shipper}` : ''}` : ''}. Funds release to the seller in 7 days unless you confirm delivery sooner.`,
    },
    DELIVERED: {
      emoji: '🎉',
      headline: 'Order delivered',
      detail: 'Your order has been marked as delivered. We hope you love it!',
    },
    CANCELLED: {
      emoji: '❌',
      headline: 'Order cancelled',
      detail:
        'The seller has cancelled your order. If you were charged, please contact support.',
    },
  }
  const { emoji, headline, detail } = info[status] || info.CONFIRMED
  const subject = `${emoji} Order #${orderId} — ${headline}`
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrap{max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden}
.hd{background:#e31837;padding:28px 32px;text-align:center}
.hd h1{color:#fff;margin:0;font-size:20px}
.bd{padding:32px}
.badge{display:inline-block;font-size:13px;background:#fef3c7;color:#92400e;padding:4px 10px;border-radius:20px;margin-bottom:16px}
p{font-size:15px;color:#333;line-height:1.6;margin:0 0 12px}
.ft{text-align:center;padding:16px;font-size:12px;color:#aaa}
</style></head><body>
<div class="wrap"><div class="hd"><h1>${appName}</h1></div>
<div class="bd"><span class="badge">Order #${orderId}</span>
<p><strong>${emoji} ${headline}.</strong> ${detail}</p>
<p style="color:#888;font-size:13px">Questions? Reply to this email or visit the app.</p>
</div><div class="ft">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</div></div>
</body></html>`
  return {
    subject,
    html,
    text: `${emoji} ${headline} — Order #${orderId}\n\n${detail}`,
  }
}

export function buildOrderCancelledSellerEmail(
  orderId: number,
  storeName: string,
  appName = 'MarketX',
): { subject: string; html: string; text: string } {
  const subject = `❌ Order #${orderId} has been cancelled`
  const detail = `Order #${orderId} placed at ${storeName} has been cancelled by the buyer. No action needed — stock has been automatically restored.`
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrap{max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden}
.hd{background:#e31837;padding:28px 32px;text-align:center}
.hd h1{color:#fff;margin:0;font-size:20px}
.bd{padding:32px}
.badge{display:inline-block;font-size:13px;background:#fee2e2;color:#991b1b;padding:4px 10px;border-radius:20px;margin-bottom:16px}
p{font-size:15px;color:#333;line-height:1.6;margin:0 0 12px}
.ft{text-align:center;padding:16px;font-size:12px;color:#aaa}
</style></head><body>
<div class="wrap"><div class="hd"><h1>${appName}</h1></div>
<div class="bd"><span class="badge">Order #${orderId} cancelled</span>
<p>${detail}</p>
</div><div class="ft">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</div></div>
</body></html>`
  return { subject, html, text: `Order #${orderId} Cancelled\n\n${detail}` }
}

export function buildReviewReceivedEmail(
  targetName: string,
  rating: number,
  reviewTitle?: string,
  appName = 'MarketX',
): { subject: string; html: string; text: string } {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const subject = `New ${rating}-star review on ${targetName}`
  const detail = `You received a ${rating}-star review${reviewTitle ? ` titled "${reviewTitle}"` : ''} on ${targetName}.`
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrap{max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden}
.hd{background:#e31837;padding:28px 32px;text-align:center}
.hd h1{color:#fff;margin:0;font-size:20px}
.bd{padding:32px}
.stars{font-size:28px;color:#f59e0b;letter-spacing:2px;margin:0 0 12px;display:block}
p{font-size:15px;color:#333;line-height:1.6;margin:0 0 12px}
.ft{text-align:center;padding:16px;font-size:12px;color:#aaa}
</style></head><body>
<div class="wrap"><div class="hd"><h1>${appName}</h1></div>
<div class="bd"><span class="stars">${stars}</span>
<p>${detail}</p>
</div><div class="ft">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</div></div>
</body></html>`
  return { subject, html, text: `New Review: ${stars}\n\n${detail}` }
}

export function buildNewConversationEmail(
  senderName: string,
  productTitle?: string,
  appName = 'MarketX',
): { subject: string; html: string; text: string } {
  const subject = `New message from ${senderName}${productTitle ? ` about "${productTitle}"` : ''}`
  const detail = `${senderName} started a conversation with you${productTitle ? ` about "${productTitle}"` : ''}. Open the app to reply.`
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrap{max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden}
.hd{background:#e31837;padding:28px 32px;text-align:center}
.hd h1{color:#fff;margin:0;font-size:20px}
.bd{padding:32px}
p{font-size:15px;color:#333;line-height:1.6;margin:0}
.ft{text-align:center;padding:16px;font-size:12px;color:#aaa}
</style></head><body>
<div class="wrap"><div class="hd"><h1>${appName}</h1></div>
<div class="bd"><p>💬 ${detail}</p></div>
<div class="ft">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</div></div>
</body></html>`
  return { subject, html, text: `New message from ${senderName}\n\n${detail}` }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string = 'User',
  appName?: string,
): Promise<{ id: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #333; margin: 0; }
          .content { margin: 20px 0; line-height: 1.6; color: #555; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${appName}!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            
            <p>Thank you for joining ${appName}! We're excited to have you in our community.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Browse our curated fashion collections</li>
              <li>Connect with sellers worldwide</li>
              <li>Express your unique style</li>
            </ul>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy shopping!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 ReelCart. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `Welcome to ReelCart, ${userName}!`,
    html,
    text: `Welcome to ReelCart, ${userName}! Happy shopping!`,
  })
}
