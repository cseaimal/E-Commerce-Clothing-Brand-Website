import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Checkout.css';

export default function Checkout({ navigate }) {
  const { cart, items, clearCart, clear, cartTotal } = useCart();
  const cartList = items || cart || [];

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (cartList.length === 0) {
      setError('Your cart is empty. Add items to checkout.');
      return;
    }

    if (!shippingAddress.street.trim() || !shippingAddress.city.trim() || !shippingAddress.phone.trim()) {
      setError('Please fill in all shipping address fields (street, city, and phone).');
      return;
    }

    setLoading(true);

    try {
      // Structure payload for POST /api/orders
      const orderPayload = {
        items: cartList.map((item) => ({
          product: item.product || item._id,
          variant: item.variant || { size: 'Standard', color: 'Default' },
          qty: item.qty || item.quantity || 1,
          price: item.price || 0,
        })),
        shippingAddress: {
          street: shippingAddress.street.trim(),
          city: shippingAddress.city.trim(),
          phone: shippingAddress.phone.trim(),
        },
        paymentMethod: 'COD',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_user_token',
          'x-user-id': '64f1a2b3c4d5e6f7a8b9c0d1'
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Clear the cart using CartContext clear/clearCart function as requested
      if (typeof clear === 'function') {
        clear();
      } else if (typeof clearCart === 'function') {
        clearCart();
      }

      const orderId = data._id || data.id || 'ORDER_' + Date.now();

      // Redirect to /order-confirmation/:orderId
      if (typeof navigate === 'function') {
        navigate(`/order-confirmation/${orderId}`);
      } else if (window.location) {
        window.location.href = `/order-confirmation/${orderId}`;
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <header className="checkout-header">
          <h1>Secure Checkout</h1>
          <p>Complete your order for fast delivery</p>
        </header>

        {error && <div className="checkout-error-alert">{error}</div>}

        <div className="checkout-grid">
          {/* Form Column */}
          <div className="checkout-form-section">
            <form onSubmit={handlePlaceOrder} id="checkout-form">
              {/* Shipping Address Section */}
              <div className="checkout-card">
                <h2>1. Shipping Address</h2>
                <div className="form-group">
                  <label htmlFor="street">Street Address *</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    placeholder="House / Apartment #, Street Name"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="03XXXXXXXXX"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector Section */}
              <div className="checkout-card">
                <h2>2. Payment Method</h2>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <div className="payment-details">
                      <span className="payment-title">Cash on Delivery (COD)</span>
                      <span className="payment-desc">Pay cash when your package arrives at your doorstep</span>
                    </div>
                    <span className="badge badge-success">Available</span>
                  </label>

                  <label className="payment-option disabled">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                    />
                    <div className="payment-details">
                      <span className="payment-title">Credit / Debit Card</span>
                      <span className="payment-desc">Visa, Mastercard, UnionPay</span>
                    </div>
                    <span className="badge badge-disabled">Disabled / Coming Soon</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={loading || cartList.length === 0}
              >
                {loading ? 'Placing Order...' : `Place Order (PKR ${cartTotal.toLocaleString()})`}
              </button>
            </form>
          </div>

          {/* Order Summary Column */}
          <div className="checkout-summary-section">
            <div className="checkout-card summary-card">
              <h2>Order Summary</h2>
              
              {cartList.length === 0 ? (
                <p className="empty-cart-msg">Your cart is empty.</p>
              ) : (
                <>
                  <div className="cart-items-list">
                    {cartList.map((item, index) => (
                      <div key={index} className="summary-item">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="summary-item-img" />
                        )}
                        <div className="summary-item-info">
                          <span className="summary-item-name">{item.name || 'Product'}</span>
                          <span className="summary-item-variant">
                            {item.variant?.size && `Size: ${item.variant.size}`}
                            {item.variant?.color && ` | Color: ${item.variant.color}`}
                          </span>
                          <span className="summary-item-qty">Qty: {item.qty}</span>
                        </div>
                        <span className="summary-item-price">
                          PKR {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-totals">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>PKR {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping Fee</span>
                      <span className="free-shipping">FREE</span>
                    </div>
                    <hr />
                    <div className="summary-row total-row">
                      <span>Total</span>
                      <span>PKR {cartTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
