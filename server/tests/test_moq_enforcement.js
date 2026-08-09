function simulateProductDetailQuantityLogic(userRole, product, selectedQty) {
  const isWholesaleUser = userRole === 'wholesale';
  const moqRequirement = product.moq || 12;

  let moqError = null;
  let isAddToCartBlocked = false;

  if (isWholesaleUser && selectedQty < moqRequirement) {
    moqError = `Minimum order quantity for Wholesale accounts is ${moqRequirement} units.`;
    isAddToCartBlocked = true;
  }

  const effectivePrice = isWholesaleUser ? product.wholesalePrice : product.price;

  return {
    isWholesaleUser,
    moqRequirement,
    selectedQty,
    moqError,
    isAddToCartBlocked,
    effectivePrice,
    totalPrice: effectivePrice * selectedQty,
  };
}

function runMoqEnforcementTest() {
  console.log('================================================================');
  console.log('   TESTING ROLE-BASED MOQ (MINIMUM ORDER QTY) ENFORCEMENT       ');
  console.log('================================================================');

  const product = {
    _id: '64f1a2b3c4d5e6f7a8b9c0a1',
    name: 'Royal Velvet Embroidered Abaya',
    price: 4500,
    wholesalePrice: 3150,
    moq: 12,
  };

  // TEST 1: Wholesale Account with qty < MOQ (qty = 5, MOQ = 12)
  console.log('\n1. [WHOLESALE USER - BELOW MOQ TEST]: User role = "wholesale", trying qty = 5 (MOQ = 12)...');
  const test1 = simulateProductDetailQuantityLogic('wholesale', product, 5);
  console.log(`✓ MOQ Error Displayed: "${test1.moqError}"`);
  console.log(`✓ Add to Cart Blocked: ${test1.isAddToCartBlocked}`);

  const isTest1Passed = test1.isAddToCartBlocked === true && test1.moqError !== null;

  // TEST 2: Wholesale Account with qty >= MOQ (qty = 12, MOQ = 12)
  console.log('\n2. [WHOLESALE USER - VALID MOQ TEST]: User role = "wholesale", selecting qty = 12 (MOQ = 12)...');
  const test2 = simulateProductDetailQuantityLogic('wholesale', product, 12);
  console.log(`✓ MOQ Error Displayed: ${test2.moqError || 'None (Valid Quantity)'}`);
  console.log(`✓ Add to Cart Blocked: ${test2.isAddToCartBlocked}`);
  console.log(`✓ Unit Price: PKR ${test2.effectivePrice} | Total: PKR ${test2.totalPrice}`);

  const isTest2Passed = test2.isAddToCartBlocked === false && test2.moqError === null;

  // TEST 3: Standard Customer Account with qty < MOQ (qty = 2, MOQ = 12)
  console.log('\n3. [NORMAL CUSTOMER - NO MOQ RESTRICTION TEST]: User role = "customer", selecting qty = 2...');
  const test3 = simulateProductDetailQuantityLogic('customer', product, 2);
  console.log(`✓ MOQ Error Displayed: ${test3.moqError || 'None (No restriction for standard customers)'}`);
  console.log(`✓ Add to Cart Blocked: ${test3.isAddToCartBlocked}`);
  console.log(`✓ Unit Price: PKR ${test3.effectivePrice} | Total: PKR ${test3.totalPrice}`);

  const isTest3Passed = test3.isAddToCartBlocked === false && test3.moqError === null;

  if (isTest1Passed && isTest2Passed && isTest3Passed) {
    console.log('\n✨ ================================================================');
    console.log('   MOQ ENFORCEMENT TEST PASSED FULLY! 🚀');
    console.log('   (Wholesale account MOQ enforced & Normal customer unrestricted!)');
    console.log('   ================================================================\n');
  } else {
    console.error('\n❌ MOQ ENFORCEMENT TEST FAILED');
  }
}

runMoqEnforcementTest();
