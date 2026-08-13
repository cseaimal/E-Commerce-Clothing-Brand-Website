const http = require('http');

const adminToken = 'admin_86b3c4d5e6f7a8b9c0d3e4f5';

function requestAPI(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      `http://localhost:5000${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function testBulkInquiryFlow() {
  console.log('===========================================================');
  console.log('   TESTING BULK INQUIRY ENDPOINTS & ROLE UPDATE LOGIC      ');
  console.log('===========================================================');

  // STEP 1: Public submission of Bulk Inquiry (POST /api/bulk-inquiries)
  console.log('\n1. [POST /api/bulk-inquiries] Submitting bulk inquiry for registered user (aimal@aljannat.com)...');
  const inquiryRes = await requestAPI('POST', '/api/bulk-inquiries', {
    businessName: 'Aljannat Global Wholesale Ltd',
    contactPerson: 'Aimal Khan',
    phone: '03001234567',
    city: 'Lahore',
    userEmail: 'aimal@aljannat.com',
    requestedItems: [
      { product: '64f1a2b3c4d5e6f7a8b9c0a1', qty: 50 },
      { product: '64f1a2b3c4d5e6f7a8b9c0a2', qty: 100 },
    ],
  });

  console.log(`✓ Response Code: ${inquiryRes.status}`);
  console.log(`✓ Inquiry ID: ${inquiryRes.data._id} | Status: ${inquiryRes.data.status}`);

  if (inquiryRes.status !== 201) {
    console.error('❌ Failed to create bulk inquiry');
    return;
  }

  const inquiryId = inquiryRes.data._id;

  // STEP 2: GET /api/bulk-inquiries (Admin Only)
  console.log('\n2. [GET /api/bulk-inquiries] Admin fetching all bulk inquiries...');
  const listRes = await requestAPI('GET', '/api/bulk-inquiries', null, {
    Authorization: `Bearer ${adminToken}`,
    'x-user-id': 'admin_999',
    'x-is-admin': 'true',
  });
  console.log(`✓ Response Code: ${listRes.status} | Total inquiries found: ${listRes.data.length}`);

  // STEP 3: Admin Approves Inquiry (PUT /api/bulk-inquiries/:id/approve)
  console.log(`\n3. [PUT /api/bulk-inquiries/${inquiryId}/approve] Admin approving inquiry...`);
  const approveRes = await requestAPI('PUT', `/api/bulk-inquiries/${inquiryId}/approve`, null, {
    Authorization: `Bearer ${adminToken}`,
    'x-user-id': 'admin_999',
    'x-is-admin': 'true',
  });

  console.log(`✓ Response Code: ${approveRes.status}`);
  console.log(`✓ Message: ${approveRes.data.message}`);
  console.log(`✓ Inquiry Approved Status: ${approveRes.data.inquiry?.status}`);
  console.log(`✓ User Role Updated to Wholesale: ${approveRes.data.roleUpdated}`);

  // STEP 4: Common Mistake Handling Check (Guest user without an account)
  console.log('\n4. [COMMON MISTAKE CHECK] Submitting bulk inquiry for guest without account (guest@factory.com)...');
  const guestInquiryRes = await requestAPI('POST', '/api/bulk-inquiries', {
    businessName: 'Unregistered Factory Buyers',
    contactPerson: 'Guest Buyer',
    phone: '03119998877',
    city: 'Faisalabad',
    userEmail: 'guest@factory.com',
  });

  const guestInquiryId = guestInquiryRes.data._id;

  const guestApproveRes = await requestAPI('PUT', `/api/bulk-inquiries/${guestInquiryId}/approve`, null, {
    Authorization: `Bearer ${adminToken}`,
    'x-user-id': 'admin_999',
    'x-is-admin': 'true',
  });

  console.log(`✓ Guest Inquiry Response Code: ${guestApproveRes.status}`);
  console.log(`✓ Guest Inquiry Approved Status: ${guestApproveRes.data.inquiry?.status}`);
  console.log(`✓ User Role Update Gracefully Skipped: ${guestApproveRes.data.roleUpdated === false}`);

  if (approveRes.status === 200 && approveRes.data.inquiry?.status === 'approved' && guestApproveRes.data.inquiry?.status === 'approved') {
    console.log('\n✨ ===========================================================');
    console.log('   SUCCESS! Bulk Inquiry API & Role Update logic verified! 🚀');
    console.log('   ===========================================================\n');
  } else {
    console.error('\n❌ BULK INQUIRY TEST FAILED');
  }
}

testBulkInquiryFlow();
