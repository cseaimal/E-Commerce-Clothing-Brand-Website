const http = require('http');

const userId = '64f1a2b3c4d5e6f7a8b9c0d1';
const userToken = 'jwt_test_token_aimal_123';

function postOrder(orderData) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(orderData);
    const req = http.request(
      'http://localhost:5000/api/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'x-user-id': userId
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getMyOrders() {
  return new Promise((resolve, reject) => {
    http.get(
      'http://localhost:5000/api/orders/my',
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'x-user-id': userId
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      }
    );
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runMultiOrderHistoryTest() {
  console.log('===========================================================');
  console.log('   TESTING 3 SEQUENTIAL ORDERS & ORDER HISTORY ORDERING    ');
  console.log('===========================================================');

  // Order #1: Placed First
  console.log('\n📦 Placing Order #1...');
  const order1 = await postOrder({
    items: [
      { product: '64f1a2b3c4d5e6f7a8b9c0a1', name: 'Royal Velvet Embroidered Abaya', qty: 1, price: 4500, variant: { size: 'L', color: 'Black' } }
    ],
    shippingAddress: { street: '123 Mall Road', city: 'Lahore', phone: '03001112223' },
    paymentMethod: 'COD'
  });
  console.log(`✓ Order #1 Created! ID: ${order1._id} | Total: ${order1.total} PKR | Date: ${order1.createdAt}`);

  await sleep(1000);

  // Order #2: Placed Second
  console.log('\n📦 Placing Order #2...');
  const order2 = await postOrder({
    items: [
      { product: '64f1a2b3c4d5e6f7a8b9c0a2', name: 'Silk Chiffon Premium Hijab', qty: 2, price: 1200, variant: { size: 'Free Size', color: 'Emerald Green' } },
      { product: '64f1a2b3c4d5e6f7a8b9c0a3', name: 'Arabian Royal Amber Perfume Oud', qty: 1, price: 3800, variant: { size: '100ml', color: 'Gold' } }
    ],
    shippingAddress: { street: '45 Clifton Block 5', city: 'Karachi', phone: '03214445556' },
    paymentMethod: 'COD'
  });
  console.log(`✓ Order #2 Created! ID: ${order2._id} | Total: ${order2.total} PKR | Date: ${order2.createdAt}`);

  await sleep(1000);

  // Order #3: Placed Third (Most Recent)
  console.log('\n📦 Placing Order #3...');
  const order3 = await postOrder({
    items: [
      { product: '64f1a2b3c4d5e6f7a8b9c0a2', name: 'Silk Chiffon Premium Hijab', qty: 1, price: 1200, variant: { size: 'Free Size', color: 'Rose Gold' } }
    ],
    shippingAddress: { street: '78 F-7 Markaz', city: 'Islamabad', phone: '03337778889' },
    paymentMethod: 'COD'
  });
  console.log(`✓ Order #3 Created! ID: ${order3._id} | Total: ${order3.total} PKR | Date: ${order3.createdAt}`);

  // Fetch Order History from GET /api/orders/my
  console.log('\n🔍 Fetching Order History via GET /api/orders/my...');
  const history = await getMyOrders();

  console.log(`\n📋 History Page Received ${history.length} Total Orders.`);

  console.log('\n--- ORDER HISTORY CHRONOLOGICAL VERIFICATION ---');
  history.slice(0, 3).forEach((ord, index) => {
    console.log(`Position [${index + 1}]: ID: ${ord._id} | Total: ${ord.total} PKR | City: ${ord.shippingAddress?.city} | Date: ${ord.createdAt}`);
  });

  // Verify that the most recent order (Order #3) is at index 0 (Position 1)
  const firstInHistory = String(history[0]._id);
  const isMostRecentFirst = firstInHistory === String(order3._id);

  if (isMostRecentFirst) {
    console.log('\n✨ ===========================================================');
    console.log('   SUCCESS! Orders appear in correct order (Most Recent First) 🚀');
    console.log('   ===========================================================\n');
  } else {
    console.error('\n❌ ERROR: Order sequence in history does not match most recent first.');
  }
}

runMultiOrderHistoryTest();
