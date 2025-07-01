
import nodemailer from 'nodemailer';
import { getEmailSettings } from './data';

export async function sendVerificationEmail(to, token) {
    const emailSettings = await getEmailSettings();

    if (!emailSettings?.host || !emailSettings.username || !emailSettings.password) {
        console.error("Email settings are not fully configured. Cannot send verification email.");
        // In a real production app, you might want to throw an error or handle this more gracefully.
        // For now, we'll log the error and prevent the app from crashing.
        return;
    }

    const transporter = nodemailer.createTransport({
        host: emailSettings.host,
        port: emailSettings.port,
        secure: emailSettings.secure, // true for 465, false for other ports
        auth: {
            user: emailSettings.username,
            pass: emailSettings.password,
        },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: `"${emailSettings.from_name}" <${emailSettings.from_email}>`,
        to: to,
        subject: 'Verify Your Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to Zain Inspired E-Shop!</h2>
                <p>Thanks for signing up. Please click the button below to verify your email address and activate your account.</p>
                <a href="${verificationUrl}" style="background-color: #e83e8c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
                <p>If you did not sign up for this account, you can safely ignore this email.</p>
                <br>
                <p>Best regards,</p>
                <p>The Zain Inspired Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Could not send verification email.');
    }
}
