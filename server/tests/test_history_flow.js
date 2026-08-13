const http = require('http');

async function testHistoryAndConfirmationDetails() {
  console.log('--- TESTING ORDER CONFIRMATION & HISTORY ENDPOINTS ---');

  // Step 1: Create a test order first
  const payload = JSON.stringify({
    items: [
      {
        product: '64f1a2b3c4d5e6f7a8b9c0a1',
        variant: { size: 'XL', color: 'Royal Navy' },
        qty: 1,
        price: 4500
      }
    ],
    shippingAddress: {
      street: 'Flat 4B, Regency Towers',
      city: 'Islamabad',
      phone: '03112223344'
    },
    paymentMethod: 'COD'
  });

  const postReq = http.request(
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
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const order = JSON.parse(data);
        const orderId = order._id;
        console.log('1. [ORDER CREATED]: ID =', orderId);

        // Step 2: Fetch single order details (OrderConfirmation test)
        http.get(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: {
              'Authorization': 'Bearer test_token',
              'x-user-id': '64f1a2b3c4d5e6f7a8b9c0d1'
            }
          },
          (res2) => {
            let data2 = '';
            res2.on('data', (c) => (data2 += c));
            res2.on('end', () => {
              const confOrder = JSON.parse(data2);
              console.log('2. [GET /api/orders/:id]: Status =', res2.statusCode, '| Found Order Total =', confOrder.total, 'PKR');

              // Step 3: Fetch order history (OrderHistory test)
              http.get(
                'http://localhost:5000/api/orders/my',
                {
                  headers: {
                    'Authorization': 'Bearer test_token',
                    'x-user-id': '64f1a2b3c4d5e6f7a8b9c0d1'
                  }
                },
                (res3) => {
                  let data3 = '';
                  res3.on('data', (c) => (data3 += c));
                  res3.on('end', () => {
                    const history = JSON.parse(data3);
                    console.log('3. [GET /api/orders/my]: Total orders in history =', history.length);
                    console.log('   Most recent order status =', history[0]?.status, '| Date =', history[0]?.createdAt);

                    if (res2.statusCode === 200 && res3.statusCode === 200 && history.length > 0) {
                      console.log('\n✅ [ORDER CONFIRMATION & ORDER HISTORY VERIFICATION PASSED!]');
                    } else {
                      console.error('\n❌ [TEST FAILED]');
                    }
                  });
                }
              );
            });
          }
        );
      });
    }
  );

  postReq.write(payload);
  postReq.end();
}

testHistoryAndConfirmationDetails();
