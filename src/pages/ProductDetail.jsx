import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Checkout.css';

const SAMPLE_PRODUCT_DETAIL = {
  _id: '64f1a2b3c4d5e6f7a8b9c0a1',
  name: 'Royal Velvet Embroidered Abaya',
  price: 4500,
  wholesalePrice: 3150,
  moq: 12, // Minimum Order Quantity for Wholesale buyers
  category: 'Abayas',
  image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  description: 'Handcrafted luxury velvet abaya featuring intricate silver thread embroidery, tailored for elegant modesty.',
  availableSizes: ['S', 'M', 'L', 'XL'],
  availableColors: ['Midnight Black', 'Emerald Green', 'Royal Navy'],
};

export default function ProductDetail({ productId, navigate }) {
  const { user } = useAuth();
  const { addToCart, cartCount } = useCart();

  const isWholesaleUser = user?.role === 'wholesale';
  const product = SAMPLE_PRODUCT_DETAIL;
  const moqRequirement = product.moq || 12;

  // Set initial quantity: if Wholesale user, default to MOQ (12), otherwise 1
  const [qty, setQty] = useState(isWholesaleUser ? moqRequirement : 1);
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.availableColors[0]);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [moqError, setMoqError] = useState(null);

  // Re-evaluate quantity min when user role updates
  useEffect(() => {
    if (isWholesaleUser && qty < moqRequirement) {
      setQty(moqRequirement);
      setMoqError(null);
    }
  }, [isWholesaleUser, moqRequirement]);

  const handleQtyChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setQty(val);

    if (isWholesaleUser && val < moqRequirement) {
      setMoqError(`Minimum order quantity for Wholesale accounts is ${moqRequirement} units.`);
    } else {
      setMoqError(null);
    }
  };

  const isAddToCartBlocked = isWholesaleUser && qty < moqRequirement;
  const effectivePrice = isWholesaleUser ? product.wholesalePrice : product.price;

  const handleAddToCart = () => {
    if (isAddToCartBlocked) return;

    addToCart({
      _id: product._id,
      product: product._id,
      name: product.name,
      price: effectivePrice,
      image: product.image,
      variant: { size: selectedSize, color: selectedColor },
      qty: Number(qty),
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="checkout-container">
      <button className="back-home-btn secondary" onClick={() => (navigate ? navigate('/catalog') : (window.location.href = '/catalog'))}>
        ← Back to Catalog
      </button>

      <div className="product-detail-card">
        <div className="detail-grid">
          {/* Product Image */}
          <div className="detail-image-box">
            <img src={product.image} alt={product.name} className="detail-img" />
          </div>

          {/* Product Info & MOQ Form */}
          <div className="detail-info-box">
            <span className="product-category">{product.category}</span>
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-desc">{product.description}</p>

            {/* Pricing Section */}
            <div className="detail-price-box">
              {isWholesaleUser ? (
                <div>
                  <div className="price-row">
                    <span className="wholesale-active-price">PKR {product.wholesalePrice.toLocaleString()}</span>
                    <span className="original-strikethrough-price">PKR {product.price.toLocaleString()}</span>
                    <span className="discount-tag">30% WHOLESALE RATE</span>
                  </div>
                  <div className="moq-info-banner">
                    📦 <strong>Minimum Order Quantity: {moqRequirement} units</strong> for Wholesale Partner accounts.
                  </div>
                </div>
              ) : (
                <div className="price-row">
                  <span className="product-price">PKR {product.price.toLocaleString()}</span>
                  <span className="customer-no-moq-badge">Standard Retail (No MOQ Limit)</span>
                </div>
              )}
            </div>

            {/* Variants */}
            <div className="variant-selectors">
              <div className="selector-group">
                <label>Size:</label>
                <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                  {product.availableSizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="selector-group">
                <label>Color:</label>
                <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                  {product.availableColors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity Input with MOQ Enforcement */}
            <div className="qty-section">
              <label htmlFor="detail-qty">
                Order Quantity: {isWholesaleUser && <span className="req-star">* (Min {moqRequirement})</span>}
              </label>
              <input
                type="number"
                id="detail-qty"
                min={isWholesaleUser ? moqRequirement : 1}
                value={qty}
                onChange={handleQtyChange}
                className={moqError ? 'input-error' : ''}
              />
            </div>

            {/* MOQ Warning / Block Message */}
            {moqError && (
              <div className="moq-error-alert">
                🚫 <strong>MOQ Restriction:</strong> {moqError}
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              className={`place-order-btn ${isAddToCartBlocked ? 'btn-disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={isAddToCartBlocked}
            >
              {isAddToCartBlocked
                ? `Blocked (Minimum ${moqRequirement} Required for Wholesale)`
                : addedSuccess
                ? `✓ Added ${qty} units to Cart!`
                : `+ Add ${qty} to Cart (Total PKR ${(effectivePrice * qty).toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>

      {cartCount > 0 && (
        <div className="checkout-floating-bar">
          <span>{cartCount} item(s) in your cart</span>
          <button className="proceed-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
        </div>
      )}
    </div>
  );
}
