import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
        // preselect first variant if exists
        const firstVariant = (res.data.variants && res.data.variants[0]) || null;
        if (firstVariant) {
          setSelectedSize(firstVariant.size || '');
          setSelectedColor(firstVariant.color || '');
        }
        setSelectedImage(0);
      } catch (e) {
        setError(e.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const sizes = useMemo(() => {
    if (!product || !product.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  }, [product]);

  const colors = useMemo(() => {
    if (!product || !product.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)));
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find((v) => {
      const sizeMatch = selectedSize ? v.size === selectedSize : true;
      const colorMatch = selectedColor ? v.color === selectedColor : true;
      return sizeMatch && colorMatch;
    }) || null;
  }, [product, selectedSize, selectedColor]);

  const availableStock = selectedVariant ? Number(selectedVariant.stock || 0) : null;

  const displayPrice = useMemo(() => {
    if (!product) return '';
    if (user && user.role === 'wholesale' && typeof product.wholesalePrice === 'number') return product.wholesalePrice;
    return product.price;
  }, [product, user]);

  const handleAddToCart = () => {
    if (!product) return;
    if (availableStock !== null && qty > availableStock) return;
    const variant = selectedVariant || null;
    addToCart({ _id: product._id, product: product._id, name: product.name, variant, qty, price: displayPrice, image: (product.images && product.images[0]) || product.image, });
  };

  if (loading) return <div className="pd-spinner" />;
  if (error) return <div className="pd-empty">Error: {error}</div>;
  if (!product) return <div className="pd-empty">Product not found</div>;

  return (
    <div className="pd-container">
      <div className="pd-gallery">
        <div className="pd-main">
          <img src={(product.images && product.images[selectedImage]) || product.image || 'https://placehold.co/600x800'} alt={product.name} />
        </div>
        <div className="pd-thumbs">
          {(product.images && product.images.length ? product.images : [product.image || 'https://placehold.co/600x800']).map((src, i) => (
            <button key={i} className={`pd-thumb-btn ${i === selectedImage ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
              <img src={src} alt={`thumb-${i}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="pd-details">
        <h1 className="pd-name">{product.name}</h1>
        <div className="pd-price">Rs {displayPrice}</div>
        <div className="pd-desc">{product.description}</div>

        {product.variants && product.variants.length > 0 && (
          <div className="pd-variants">
            {sizes.length > 0 && (
              <div className="pd-variant">
                <label>Size</label>
                <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                  <option value="">Select size</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {colors.length > 0 && (
              <div className="pd-variant">
                <label>Color</label>
                <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                  <option value="">Select color</option>
                  {colors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="pd-stock">Stock: {availableStock !== null ? availableStock : '—'}</div>
          </div>
        )}

        <div className="pd-actions">
          <div className="pd-qty">
            <label>Qty</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} />
          </div>
          <button className="pd-add" onClick={handleAddToCart} disabled={availableStock !== null && availableStock <= 0}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
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
