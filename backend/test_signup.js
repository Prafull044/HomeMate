async function testRegister() {
  try {
    const email = `testuser_${Date.now()}@example.com`;
    console.log('Testing signup with email:', email);

    // If testing on port 5173 or port 5000:
    const signupRes = await fetch('http://localhost:5000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
    });
    const signupData = await signupRes.json();
    console.log('Signup HTTP Status:', signupRes.status, signupData);

    if (signupData.token) {
      console.log('Testing onboarding...');
      const onboardRes = await fetch('http://localhost:5000/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupData.token}`
        },
        body: JSON.stringify({ role: 'existing', profile: {}, preferences: {} })
      });
      const onboardData = await onboardRes.json();
      console.log('Onboarding HTTP Status:', onboardRes.status, onboardData);
    }
  } catch(e) {
    console.error('Fetch error:', e);
  }
}

testRegister();
