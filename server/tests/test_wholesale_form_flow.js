const http = require('http');

function postInquiry(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      'http://localhost:5000/api/bulk-inquiries',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testWholesaleFormSubmissions() {
  console.log('===========================================================');
  console.log('   TESTING WHOLESALE FORM SUBMISSIONS (LOGGED OUT & IN)    ');
  console.log('===========================================================');

  // TEST 1: Logged Out Public Submission (No email attached)
  console.log('\n1. [LOGGED OUT GUEST SUBMISSION]: Submitting wholesale inquiry...');
  const guestPayload = {
    businessName: 'Guest Wholesale Emporium',
    contactPerson: 'Anonymous Buyer',
    phone: '03009998877',
    city: 'Rawalpindi',
    requestedItems: [
      { product: '64f1a2b3c4d5e6f7a8b9c0a1', qty: 25 }
    ]
  };

  const guestRes = await postInquiry(guestPayload);
  console.log(`✓ HTTP Status Code: ${guestRes.status}`);
  console.log(`✓ Inquiry ID Created: ${guestRes.data._id}`);
  console.log(`✓ User Email Attached: ${guestRes.data.userEmail || '(None - Correct for Logged Out Guest)'}`);

  const isGuestSuccess = guestRes.status === 201 && guestRes.data._id && !guestRes.data.userEmail;

  // TEST 2: Logged In Submission (Includes AuthContext email: aimal@aljannat.com)
  console.log('\n2. [LOGGED IN USER SUBMISSION]: Submitting wholesale inquiry with AuthContext userEmail...');
  const loggedInPayload = {
    businessName: 'Aljannat Direct Distributors',
    contactPerson: 'Aimal Khan',
    phone: '03001234567',
    city: 'Lahore',
    userEmail: 'aimal@aljannat.com',
    requestedItems: [
      { product: '64f1a2b3c4d5e6f7a8b9c0a2', qty: 100 }
    ]
  };

  const userRes = await postInquiry(loggedInPayload);
  console.log(`✓ HTTP Status Code: ${userRes.status}`);
  console.log(`✓ Inquiry ID Created: ${userRes.data._id}`);
  console.log(`✓ User Email Attached: ${userRes.data.userEmail}`);

  const isUserSuccess = userRes.status === 201 && userRes.data._id && userRes.data.userEmail === 'aimal@aljannat.com';

  if (isGuestSuccess && isUserSuccess) {
    console.log('\n✨ ===========================================================');
    console.log('   SUCCESS! Both Logged Out & Logged In submissions verified! 🚀');
    console.log('   ===========================================================\n');
  } else {
    console.error('\n❌ TEST FAILED');
  }
}

testWholesaleFormSubmissions();
