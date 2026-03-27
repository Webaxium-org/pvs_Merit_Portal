// Simple test script to test the login endpoint
import fetch from 'node:fetch';

const testLogin = async () => {
  console.log('Testing Login Endpoint...\n');

  const url = 'http://localhost:4000/api/v2/auth/login';
  const credentials = {
    email: 'hr@pvschemicals.com',
    password: 'abc123xyz',
    authMethod: 'local'
  };

  console.log('URL:', url);
  console.log('Body:', JSON.stringify(credentials, null, 2));
  console.log('\nSending request...\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('\nResponse Body:');

    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch {
      console.log(data);
    }

    if (response.ok) {
      console.log('\n✅ Login test PASSED!');
    } else {
      console.log('\n❌ Login test FAILED!');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Make sure the server is running on http://localhost:4000');
  }
};

testLogin();
