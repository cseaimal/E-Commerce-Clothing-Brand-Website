import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Checkout.css';

const SAMPLE_PRODUCTS = [
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a1',
    name: 'Royal Velvet Embroidered Abaya',
    price: 4500,
    wholesalePrice: 3150,
    category: 'Abayas',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80',
    availableSizes: ['S', 'M', 'L', 'XL'],
    availableColors: ['Midnight Black', 'Emerald Green', 'Royal Navy'],
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a2',
    name: 'Silk Chiffon Premium Hijab',
    price: 1200,
    wholesalePrice: 840,
    category: 'Hijabs',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80',
    availableSizes: ['Free Size'],
    availableColors: ['Rose Gold', 'Pearl White', 'Champagne'],
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a3',
    name: 'Arabian Royal Amber Perfume Oud',
    price: 3800,
    wholesalePrice: 2660,
    category: 'Fragrances',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=500&q=80',
    availableSizes: ['50ml', '100ml'],
    availableColors: ['Gold Edition'],
  },
];

export default function ProductCatalog({ navigate }) {
  const { addToCart, cartCount } = useCart();
  const { user } = useAuth();
  const isWholesaleUser = user?.role === 'wholesale';

  const [selectedVariants, setSelectedVariants] = useState({});
  const [addedProductId, setAddedProductId] = useState(null);

  const handleVariantChange = (productId, type, value) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [type]: value,
      },
    }));
  };

  const handleAddToCart = (product) => {
    const variant = {
      size: selectedVariants[product._id]?.size || product.availableSizes[0],
      color: selectedVariants[product._id]?.color || product.availableColors[0],
    };

    const effectivePrice = isWholesaleUser ? product.wholesalePrice : product.price;

    addToCart({
      _id: product._id,
      product: product._id,
      name: product.name,
      price: effectivePrice,
      image: product.image,
      variant,
      qty: 1,
    });

    setAddedProductId(product._id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <div className="checkout-container">
      <header className="checkout-header">
        <h1>Aljannat Collection</h1>
        <p>Explore luxury modesty & fragrance</p>

        {/* Role Banner Badge */}
        {isWholesaleUser ? (
          <div className="wholesale-user-banner">
            ⭐ <strong>Wholesale Partner Account Active!</strong> You are enjoying 30% bulk partner pricing on all items.
          </div>
        ) : (
          <div className="standard-user-banner">
            💡 Are you a retailer or business buyer? Apply on our <a href="/wholesale" onClick={(e) => { e.preventDefault(); navigate('/wholesale'); }}>Wholesale Page</a> for 30% bulk discounts!
          </div>
        )}
      </header>

      <div className="catalog-grid">
        {SAMPLE_PRODUCTS.map((product) => {
          const currentSize = selectedVariants[product._id]?.size || product.availableSizes[0];
          const currentColor = selectedVariants[product._id]?.color || product.availableColors[0];
          const effectivePrice = isWholesaleUser ? product.wholesalePrice : product.price;

          return (
            <div key={product._id} className={`product-card ${isWholesaleUser ? 'wholesale-card' : ''}`}>
              <img src={product.image} alt={product.name} className="product-img" />
              <div className="product-details">
                <div className="product-header-row">
                  <span className="product-category">{product.category}</span>
                  {isWholesaleUser && <span className="badge badge-success">Wholesale Rate</span>}
                </div>

                <h3 className="product-title">{product.name}</h3>

                {/* Price Display */}
                <div className="price-display-box">
                  {isWholesaleUser ? (
                    <>
                      <span className="wholesale-active-price">PKR {product.wholesalePrice.toLocaleString()}</span>
                      <span className="original-strikethrough-price">PKR {product.price.toLocaleString()}</span>
                      <span className="discount-tag">30% OFF</span>
                    </>
                  ) : (
                    <span className="product-price">PKR {product.price.toLocaleString()}</span>
                  )}
                </div>

                {/* Variant Selectors */}
                <div className="variant-selectors">
                  <div className="selector-group">
                    <label>Size:</label>
                    <select
                      value={currentSize}
                      onChange={(e) => handleVariantChange(product._id, 'size', e.target.value)}
                    >
                      {product.availableSizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="selector-group">
                    <label>Color:</label>
                    <select
                      value={currentColor}
                      onChange={(e) => handleVariantChange(product._id, 'color', e.target.value)}
                    >
                      {product.availableColors.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  {addedProductId === product._id ? '✓ Added to Cart!' : `+ Add to Cart (PKR ${effectivePrice.toLocaleString()})`}
                </button>
              </div>
            </div>
          );
        })}
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
