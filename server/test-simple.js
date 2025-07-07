import { generateToken, sendVerificationEmail } from './utils/email.ts';

const testSimple = async () => {
  console.log('🧪 Testing email functions directly...');
  
  try {
    // Test token generation
    console.log('1. Testing token generation...');
    const token = generateToken();
    console.log('✅ Token generated:', token.substring(0, 10) + '...');
    
    // Test email sending
    console.log('2. Testing email sending...');
    await sendVerificationEmail('test@example.com', token, 'Test User');
    console.log('✅ Email sent successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testSimple(); 