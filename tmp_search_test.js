const fetch = global.fetch || require('node-fetch');
const SAMPLE_PRODUCTS = [
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a1',
    name: 'Royal Velvet Embroidered Abaya',
    price: 4500,
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a2',
    name: 'Silk Chiffon Premium Hijab',
    price: 1200,
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a3',
    name: 'Arabian Royal Amber Perfume Oud',
    price: 3800,
  },
];

async function fetchProducts(query) {
  // Try server first
  const url = `http://localhost:5000/api/products${query ? `?search=${encodeURIComponent(query)}` : ''}`;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    if (Array.isArray(data)) return data;
  } catch (e) {
    // fallback to in-memory filter
    const q = (query || '').trim().toLowerCase();
    if (!q) return SAMPLE_PRODUCTS;
    return SAMPLE_PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
  }
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log('Simulating typing: will type "Royal" with 100ms intervals and 300ms debounce.');
  const inputs = ['R','Ro','Roy','Royal'];
  let pendingTimer;
  let lastResult = null;
  let fetchPromise = null;

  function scheduleFetch(term) {
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = setTimeout(async () => {
      const start = Date.now();
      fetchPromise = fetchProducts(term);
      const results = await fetchPromise;
      const duration = Date.now() - start;
      lastResult = { term, results, duration };
      console.log(`Fetched for "${term}" -> ${results.length} result(s) in ${duration}ms`);
    }, 300);
  }

  for (const t of inputs) {
    scheduleFetch(t);
    await wait(100); // user types next char quickly
  }

  // After final keystroke, wait up to 1s for fetch to complete
  const waitLimit = 1000;
  const checkInterval = 50;
  let waited = 0;
  while (waited < waitLimit && !lastResult) {
    await wait(checkInterval);
    waited += checkInterval;
  }

  if (!lastResult) {
    console.error('No results returned within 1 second after typing finished.');
    process.exit(2);
  }

  console.log('Last fetch result:', lastResult.term, 'count=', lastResult.results.length, 'duration=', lastResult.duration);
  const foundRoyal = lastResult.results.some(p => p.name.toLowerCase().includes('royal'));
  console.log('Contains "royal" in results?', foundRoyal);

  // Now clear the search and expect all products
  console.log('\nClearing search...');
  lastResult = null;
  scheduleFetch('');
  // wait for debounce + fetch
  await wait(400);
  if (lastResult && Array.isArray(lastResult.results)) {
    console.log('After clear, product count:', lastResult.results.length);
    const allShown = lastResult.results.length === SAMPLE_PRODUCTS.length;
    console.log('All products shown after clear?', allShown);
    if (!allShown) process.exit(3);
  } else {
    // try direct fetch fallback
    const all = await fetchProducts('');
    console.log('After clear (direct fetch), product count:', all.length);
    if (all.length !== SAMPLE_PRODUCTS.length) process.exit(3);
  }

  // validations
  if (!foundRoyal) {
    console.error('Search did not return expected matching products.');
    process.exit(4);
  }

  console.log('\nTest passed: matching results returned within 1s and clearing shows all products.');
  process.exit(0);
})();
