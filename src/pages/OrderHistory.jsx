import React, { useEffect, useState } from 'react';
import '../styles/Checkout.css';

export default function OrderHistory({ navigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await fetch('/api/orders/my', {
          headers: {
            'Authorization': 'Bearer test_token',
            'x-user-id': '64f1a2b3c4d5e6f7a8b9c0d1',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load past orders');
        }

        const data = await response.json();
        // Sort most recent first
        const sortedOrders = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          : [];

        setOrders(sortedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'badge-success';
      case 'shipped':
        return 'badge-primary';
      case 'cancelled':
        return 'badge-disabled';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="checkout-container">
      <header className="checkout-header">
        <h1>My Order History</h1>
        <p>Track and view all your past purchases</p>
      </header>

      {loading ? (
        <div className="history-loading">Loading your orders...</div>
      ) : error ? (
        <div className="checkout-error-alert">{error}</div>
      ) : orders.length === 0 ? (
        <div className="history-empty-card">
          <h2>No Past Orders Found</h2>
          <p>You haven't placed any orders yet.</p>
          <button className="back-home-btn" onClick={() => (navigate ? navigate('/catalog') : (window.location.href = '/catalog'))}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="history-list">
          {orders.map((order) => (
            <div key={order._id} className="history-card">
              <div className="history-card-header">
                <div className="history-order-id">
                  <span className="order-label">Order ID:</span>
                  <span className="order-id-value">{order._id}</span>
                </div>
                <div className="history-order-meta">
                  <span className="order-date">
                    📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                  </span>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {(order.status || 'pending').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="history-items-container">
                <h4>Items Ordered ({order.items?.length || 0})</h4>
                <div className="history-items-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="history-item">
                      <div className="item-main-info">
                        <span className="item-name">{item.name || `Product ID: ${item.product}`}</span>
                        {item.variant && (
                          <span className="item-variant">
                            {item.variant.size && `Size: ${item.variant.size}`}
                            {item.variant.color && ` | Color: ${item.variant.color}`}
                          </span>
                        )}
                      </div>
                      <span className="item-qty">Qty: {item.qty}</span>
                      <span className="item-price">PKR {((item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="history-card-footer">
                <div className="shipping-info-preview">
                  <span>📍 {order.shippingAddress?.street}, {order.shippingAddress?.city}</span>
                  <span>📞 {order.shippingAddress?.phone}</span>
                </div>
                <div className="order-total-preview">
                  <span className="total-label">Total ({order.paymentMethod || 'COD'}):</span>
                  <span className="total-value">PKR {(order.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
