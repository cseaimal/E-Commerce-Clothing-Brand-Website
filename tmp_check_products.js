(async () => {
  try {
    const res = await fetch('http://localhost:6200/api/dev/products');
    const products = await res.json();
    for (const p of products) {
      console.log('---');
      console.log('Name:', p.name);
      console.log('Image:', (p.images && p.images[0]) || p.image || 'none');
      console.log('Price:', p.price);
      if (p.variants && p.variants.length) {
        console.log('Variants:');
        for (const v of p.variants) {
          console.log(`  - size: ${v.size || '-'} | color: ${v.color || '-'} | stock: ${v.stock}`);
        }
      } else {
        console.log('Variants: none');
      }
    }
  } catch (e) {
    console.error('Failed to fetch dev products:', e.message || e);
    process.exit(1);
  }
})();
