import React, { useEffect, useState } from 'react';
import '../styles/Checkout.css';

export default function OrderConfirmation({ orderId, navigate }) {
  const currentOrderId = orderId || (window.location.pathname.split('/').pop() || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentOrderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${currentOrderId}`, {
          headers: {
            'Authorization': 'Bearer test_token',
            'x-user-id': '64f1a2b3c4d5e6f7a8b9c0d1',
          },
        });

        if (!response.ok) {
          throw new Error('Could not fetch order details');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [currentOrderId]);

  return (
    <div className="checkout-container">
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        <h1>Thank You For Your Order!</h1>
        <p className="confirmation-subtitle">Your order has been received and is being processed.</p>

        {loading ? (
          <div className="loading-spinner">Loading order summary...</div>
        ) : error || !order ? (
          <div className="order-details-box">
            <div className="order-detail-item">
              <span className="label">Order Reference:</span>
              <span className="value highlight">{currentOrderId || 'ORD-UNKNOWN'}</span>
            </div>
            <div className="order-detail-item">
              <span className="label">Payment Method:</span>
              <span className="value">Cash on Delivery (COD)</span>
            </div>
            <div className="order-detail-item">
              <span className="label">Status:</span>
              <span className="value badge badge-success">Pending Dispatch</span>
            </div>
          </div>
        ) : (
          <div className="order-summary-box">
            <div className="order-meta-grid">
              <div className="order-detail-item">
                <span className="label">Order ID:</span>
                <span className="value highlight">{order._id || currentOrderId}</span>
              </div>
              <div className="order-detail-item">
                <span className="label">Order Date:</span>
                <span className="value">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
              <div className="order-detail-item">
                <span className="label">Status:</span>
                <span className={`value badge badge-${order.status === 'delivered' ? 'success' : 'pending'}`}>
                  {(order.status || 'pending').toUpperCase()}
                </span>
              </div>
              <div className="order-detail-item">
                <span className="label">Payment:</span>
                <span className="value">{order.paymentMethod || 'COD'}</span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="confirmation-items-list">
              <h3>Ordered Items</h3>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="conf-item">
                    <div className="conf-item-details">
                      <span className="conf-item-name">{item.name || `Product ID: ${item.product}`}</span>
                      {item.variant && (
                        <span className="conf-item-variant">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.color && ` | Color: ${item.variant.color}`}
                        </span>
                      )}
                    </div>
                    <span className="conf-item-qty font-mono">x{item.qty}</span>
                    <span className="conf-item-price">
                      PKR {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-items">Items summary processed</p>
              )}
            </div>

            {/* Total */}
            <div className="conf-total-row">
              <span>Total Amount (COD):</span>
              <span className="total-amount">PKR {(order.total || 0).toLocaleString()}</span>
            </div>

            {/* Delivery Address */}
            {order.shippingAddress && (
              <div className="conf-shipping-box">
                <h4>Shipping Address</h4>
                <p>
                  {order.shippingAddress.street}, {order.shippingAddress.city}
                  <br />
                  📞 {order.shippingAddress.phone}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="confirmation-actions">
          <button className="back-home-btn" onClick={() => (navigate ? navigate('/orders') : (window.location.href = '/orders'))}>
            📜 View My Order History
          </button>

          <button className="back-home-btn secondary" onClick={() => (navigate ? navigate('/catalog') : (window.location.href = '/catalog'))}>
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
