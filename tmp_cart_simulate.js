const fs = require('fs');
const path = require('path');

const CART_FILE = path.resolve(__dirname, 'tmp_aljannat_cart.json');

function saveCart(cart) {
  fs.writeFileSync(CART_FILE, JSON.stringify(cart, null, 2), 'utf8');
}

function loadCart() {
  try {
    const txt = fs.readFileSync(CART_FILE, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    return [];
  }
}

(async () => {
  // Simulate adding a product from ProductDetail
  const sampleItem = {
    product: 'p1',
    name: 'Embroidered Lawn Suit',
    variant: { size: 'M', color: 'Blue' },
    qty: 2,
    price: 4500,
    image: 'https://placehold.co/400x500'
  };

  // Load existing
  const before = loadCart();
  console.log('Cart before add:', before);

  // Add: if same product+variant exists, increase qty
  const idx = before.findIndex(i => i.product === sampleItem.product && JSON.stringify(i.variant) === JSON.stringify(sampleItem.variant));
  if (idx > -1) {
    before[idx].qty += sampleItem.qty;
  } else {
    before.push(sampleItem);
  }
  saveCart(before);

  console.log('Added item. Cart now saved to', CART_FILE);

  // Simulate page refresh by reloading from disk
  const after = loadCart();
  console.log('Cart after reload:', after);
  const totalCount = after.reduce((s, it) => s + (it.qty || 0), 0);
  const totalValue = after.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);
  console.log('Cart count:', totalCount);
  console.log('Cart total value:', totalValue);

  // Exit code 0
  process.exit(0);
})();
