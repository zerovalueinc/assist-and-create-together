import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmailConfig = async () => {
  console.log('🧪 Testing Email Configuration...');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('SMTP From:', process.env.SMTP_FROM);
  console.log('Frontend URL:', process.env.FRONTEND_URL);
  console.log('');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Test connection
    console.log('🔗 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to yourself
      subject: '🧪 PersonaOps Email System Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email System Test</h2>
          <p>Hello!</p>
          <p>This is a test email to verify that your PersonaOps email system is working correctly.</p>
          <p>If you received this email, your SMTP configuration is working properly! 🎉</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            PersonaOps - AI-Powered Sales Intelligence Platform
          </p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your SMTP credentials.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Please check your SMTP host and port.');
    }
  }
};

testEmailConfig(); 