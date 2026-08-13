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

function addItem(cart, item) {
  const idx = cart.findIndex(i => i.product === item.product && JSON.stringify(i.variant) === JSON.stringify(item.variant));
  if (idx > -1) {
    cart[idx].qty += item.qty;
  } else {
    cart.push(item);
  }
}

function updateQuantity(cart, productId, variant, qty) {
  const idx = cart.findIndex(i => i.product === productId && JSON.stringify(i.variant) === JSON.stringify(variant));
  if (idx > -1) {
    if (qty <= 0) cart.splice(idx, 1);
    else cart[idx].qty = qty;
  }
}

function removeItem(cart, productId, variant) {
  const idx = cart.findIndex(i => i.product === productId && JSON.stringify(i.variant) === JSON.stringify(variant));
  if (idx > -1) cart.splice(idx, 1);
}

(function run() {
  // start with empty cart
  let cart = [];
  saveCart(cart);
  console.log('Start cart:', cart);

  // Add multiple different products/variants
  addItem(cart, { product: 'p1', name: 'Embroidered Lawn Suit', variant: { size: 'M', color: 'Blue' }, qty: 1, price: 4500, image: 'https://placehold.co/400x500' });
  addItem(cart, { product: 'p2', name: 'Silk Kurta', variant: { size: 'L', color: 'Red' }, qty: 2, price: 3200, image: 'https://placehold.co/400x500' });
  addItem(cart, { product: 'p2', name: 'Silk Kurta', variant: { size: 'M', color: 'Red' }, qty: 1, price: 3200, image: 'https://placehold.co/400x500' });

  saveCart(cart);
  console.log('After adds:', cart);

  // Change quantities
  updateQuantity(cart, 'p1', { size: 'M', color: 'Blue' }, 3);
  updateQuantity(cart, 'p2', { size: 'L', color: 'Red' }, 1);
  saveCart(cart);
  console.log('After qty changes:', cart);

  // Remove one (remove p2 size M Red)
  removeItem(cart, 'p2', { size: 'M', color: 'Red' });
  saveCart(cart);
  console.log('After remove one variant:', cart);

  // Compute totals
  const totalCount = cart.reduce((s, it) => s + (it.qty || 0), 0);
  const totalValue = cart.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);
  console.log('Final cart count:', totalCount);
  console.log('Final cart total value:', totalValue);

  // Expected manual calculation for verification
  // p1: qty 3 * 4500 = 13500
  // p2 (L,Red): qty 1 * 3200 = 3200
  // total = 16700, count = 4

  console.log('Expected total value: 16700, expected count: 4');

  process.exit(0);
})();
