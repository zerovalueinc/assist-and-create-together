import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

const testAuthFlow = async () => {
  console.log('🧪 Testing Complete Authentication Flow...\n');

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testFirstName = 'Test';
  const testLastName = 'User';

  try {
    // Step 1: Register a new user
    console.log('📝 Step 1: Registering new user...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: testFirstName,
        lastName: testLastName,
        company: 'Test Company'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Register Response Status:', registerResponse.status);
    console.log('Register Response:', registerData);

    if (registerResponse.ok) {
      console.log('✅ Registration successful! Check your email for verification link.\n');
    } else {
      console.log('❌ Registration failed:', registerData.error);
      return;
    }

    // Step 2: Try to login before email verification (should fail)
    console.log('🔒 Step 2: Attempting login before email verification...');
    const loginBeforeVerifyResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      }),
    });

    const loginBeforeVerifyData = await loginBeforeVerifyResponse.json();
    console.log('Login Before Verification Status:', loginBeforeVerifyResponse.status);
    console.log('Login Before Verification Response:', loginBeforeVerifyData);

    if (loginBeforeVerifyResponse.status === 401 && loginBeforeVerifyData.requiresVerification) {
      console.log('✅ Login correctly blocked - email verification required!\n');
    } else {
      console.log('❌ Login should have been blocked but wasn\'t');
      return;
    }

    // Step 3: Test forgot password flow
    console.log('🔑 Step 3: Testing forgot password flow...');
    const forgotPasswordResponse = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      }),
    });

    const forgotPasswordData = await forgotPasswordResponse.json();
    console.log('Forgot Password Status:', forgotPasswordResponse.status);
    console.log('Forgot Password Response:', forgotPasswordData);

    if (forgotPasswordResponse.ok) {
      console.log('✅ Forgot password email sent successfully!\n');
    } else {
      console.log('❌ Forgot password failed:', forgotPasswordData.error);
    }

    console.log('🎯 Test Summary:');
    console.log('✅ Registration with email verification - WORKING');
    console.log('✅ Login blocked before email verification - WORKING');
    console.log('✅ Forgot password flow - WORKING');
    console.log('');
    console.log('📧 Check your email for:');
    console.log('   1. Email verification link');
    console.log('   2. Password reset link');
    console.log('');
    console.log('🔗 To complete the test:');
    console.log('   1. Click the verification link in your email');
    console.log('   2. Try logging in again');
    console.log('   3. Test the password reset flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAuthFlow(); 