const http = require('http');

async function testCheckoutIntegration() {
  console.log('--- CHECKOUT PAGE FLOW INTEGRATION TEST ---');

  const sampleCartItems = [
    {
      product: '64f1a2b3c4d5e6f7a8b9c0a1',
      variant: { size: 'L', color: 'Midnight Black' },
      qty: 1,
      price: 4500
    },
    {
      product: '64f1a2b3c4d5e6f7a8b9c0a2',
      variant: { size: 'Free Size', color: 'Emerald Green' },
      qty: 2,
      price: 1200
    }
  ];

  const shippingAddress = {
    street: '786 Luxury Avenue, Gulberg III',
    city: 'Lahore',
    phone: '03009876543'
  };

  const payload = JSON.stringify({
    items: sampleCartItems,
    shippingAddress,
    paymentMethod: 'COD'
  });

  const req = http.request(
    'http://localhost:5000/api/orders',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token',
        'x-user-id': '64f1a2b3c4d5e6f7a8b9c0d1'
      }
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const json = JSON.parse(data);
        console.log('[HTTP STATUS]:', res.statusCode);
        console.log('[ORDER CREATED ID]:', json._id);
        console.log('[PAYMENT METHOD]:', json.paymentMethod);
        console.log('[TOTAL SERVER CALCULATED]:', json.total, 'PKR');
        console.log('[REDIRECT URL]:', `/order-confirmation/${json._id}`);

        if (res.statusCode === 201 && json._id) {
          console.log('\n✅ [CHECKOUT INTEGRATION TEST PASSED CLEANLY]');
        } else {
          console.error('\n❌ [TEST FAILED]:', json);
        }
      });
    }
  );

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(payload);
  req.end();
}

testCheckoutIntegration();
