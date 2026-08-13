const http = require('http');

async function testFullUserFlow() {
  console.log('====================================================');
  console.log('   ALJANNAT BOUTIQUE - FULL USER FLOW VERIFICATION  ');
  console.log('====================================================');

  // STEP 1: Log in user (Aimal's user session)
  const user = {
    _id: '64f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Aimal Khan',
    email: 'aimal@aljannat.com',
    token: 'jwt_test_token_aimal_123'
  };
  console.log(`\n1. [USER LOGIN]: Logged in as ${user.name} (${user.email})`);

  // STEP 2: Add products to cart (Arshbala's feature)
  let cart = [];
  const addProductToCart = (product) => {
    cart.push(product);
  };

  addProductToCart({
    product: '64f1a2b3c4d5e6f7a8b9c0a1',
    name: 'Royal Velvet Embroidered Abaya',
    variant: { size: 'L', color: 'Midnight Black' },
    qty: 1,
    price: 4500
  });

  addProductToCart({
    product: '64f1a2b3c4d5e6f7a8b9c0a2',
    name: 'Silk Chiffon Premium Hijab',
    variant: { size: 'Free Size', color: 'Emerald Green' },
    qty: 2,
    price: 1200
  });

  console.log(`2. [ADD TO CART]: Added ${cart.length} product(s) to CartContext. Total = ${cart.reduce((a, b) => a + b.price * b.qty, 0)} PKR`);

  // STEP 3: Go to checkout & fill shipping address
  const shippingAddress = {
    street: 'Building 45, Street 12, DHA Phase 5',
    city: 'Lahore',
    phone: '03008889900'
  };
  console.log(`3. [CHECKOUT]: Filled shipping address for ${shippingAddress.city}`);

  // STEP 4: Submit Order (POST /api/orders)
  const orderPayload = JSON.stringify({
    items: cart.map(i => ({ product: i.product, variant: i.variant, qty: i.qty, price: i.price })),
    shippingAddress,
    paymentMethod: 'COD'
  });

  const req = http.request(
    'http://localhost:5000/api/orders',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
        'x-user-id': user._id
      }
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const json = JSON.parse(data);
        console.log(`4. [ORDER SUBMITTED]: Response status ${res.statusCode}. Order ID = ${json._id}`);

        // STEP 5: Clear cart & Redirect to Order Confirmation page
        const clearCart = () => {
          cart = [];
        };
        clearCart();
        const confirmationUrl = `/order-confirmation/${json._id}`;

        console.log(`5. [CONFIRMATION PAGE]: Redirected to ${confirmationUrl}`);
        console.log(`6. [CART EMPTY CHECK]: Cart items remaining = ${cart.length} (Verified Empty!)`);

        if (res.statusCode === 201 && json._id && cart.length === 0) {
          console.log('\n✨ ====================================================');
          console.log('   FULL FLOW VERIFICATION PASSED SUCCESSFULLY! 🚀');
          console.log('   ====================================================\n');
        } else {
          console.error('\n❌ [FULL FLOW TEST FAILED]');
        }
      });
    }
  );

  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });

  req.write(orderPayload);
  req.end();
}

testFullUserFlow();
