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
            <p>&copy; 2024 ReelCart. All rights reserved.</p>
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
