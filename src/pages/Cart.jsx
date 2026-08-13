import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

export default function Cart({ navigate }) {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  const handleQtyChange = (item, value) => {
    const qty = Number(value) || 0;
    updateQuantity(item.product, item.variant, qty);
  };

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {items.length === 0 ? (
        <div className="cart-empty">Your cart is empty.</div>
      ) : (
        <div className="cart-list">
          {items.map((it, idx) => (
            <div className="cart-item" key={idx}>
              <img className="cart-image" src={it.image || 'https://placehold.co/100x120'} alt={it.name} />
              <div className="cart-info">
                <div className="cart-name">{it.name}</div>
                <div className="cart-variant">{it.variant ? `${it.variant.size || ''} ${it.variant.color || ''}` : ''}</div>
                <div className="cart-price">Rs {it.price}</div>
              </div>
              <div className="cart-actions">
                <input
                  type="number"
                  min={0}
                  value={it.qty}
                  onChange={(e) => handleQtyChange(it, e.target.value)}
                />
                <button className="cart-remove" onClick={() => removeFromCart(it.product, it.variant)}>Remove</button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <div className="cart-total">Total: Rs {total}</div>
            <div className="cart-actions-bottom">
              <button className="cart-checkout" onClick={() => (navigate ? navigate('/checkout') : (window.location.pathname = '/checkout'))}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
