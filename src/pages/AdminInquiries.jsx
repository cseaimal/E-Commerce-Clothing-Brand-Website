import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Checkout.css';

export default function AdminInquiries({ navigate }) {
  const { updateRole } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const adminToken = 'admin_86b3c4d5e6f7a8b9c0d3e4f5';

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bulk-inquiries', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-user-id': 'admin_999',
          'x-is-admin': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load bulk inquiries');
      }

      const data = await response.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleApprove = async (id, userEmail) => {
    setActionLoadingId(id);
    setActionMsg(null);
    try {
      const response = await fetch(`/api/bulk-inquiries/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-user-id': 'admin_999',
          'x-is-admin': 'true',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to approve inquiry');
      }

      setActionMsg(`Inquiry for "${result.inquiry?.businessName}" approved! ${result.roleUpdated ? 'User role upgraded to Wholesale!' : ''}`);

      // Dynamically sync AuthContext role for local simulation
      if (userEmail) {
        updateRole('wholesale');
      }

      // Refresh list after action as requested
      await fetchInquiries();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    setActionMsg(null);
    try {
      const response = await fetch(`/api/bulk-inquiries/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-user-id': 'admin_999',
          'x-is-admin': 'true',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reject inquiry');
      }

      setActionMsg(`Inquiry rejected.`);

      // Refresh list after action as requested
      await fetchInquiries();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="checkout-container">
      <header className="checkout-header">
        <h1>Admin Bulk Inquiry Management</h1>
        <p>Review wholesale applications and approve accounts for wholesale pricing</p>
      </header>

      {error && <div className="checkout-error-alert">{error}</div>}
      {actionMsg && <div className="wholesale-success-box">{actionMsg}</div>}

      {loading ? (
        <div className="history-loading">Loading inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="history-empty-card">
          <h2>No Bulk Inquiries Submitted</h2>
          <p>Go to the public <a href="/wholesale" onClick={(e) => { e.preventDefault(); navigate('/wholesale'); }}>Wholesale Page</a> to submit an inquiry first.</p>
        </div>
      ) : (
        <div className="history-list">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="history-card">
              <div className="history-card-header">
                <div>
                  <h3 className="admin-biz-name">{inquiry.businessName}</h3>
                  <span className="admin-contact-person">Contact: <strong>{inquiry.contactPerson}</strong> ({inquiry.phone})</span>
                </div>
                <span className={`badge ${inquiry.status === 'approved' ? 'badge-success' : inquiry.status === 'rejected' ? 'badge-disabled' : 'badge-warning'}`}>
                  {(inquiry.status || 'pending').toUpperCase()}
                </span>
              </div>

              <div className="admin-inquiry-body">
                <div className="inquiry-info-row">
                  <span>📍 City: <strong>{inquiry.city || 'N/A'}</strong></span>
                  <span>📧 Account Email: <strong>{inquiry.userEmail || '(None - Public Guest)'}</strong></span>
                  <span>📅 Submitted: <strong>{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'Today'}</strong></span>
                </div>

                <div className="inquiry-items-box">
                  <h4>Requested Wholesale Items:</h4>
                  <ul>
                    {inquiry.requestedItems?.map((item, idx) => (
                      <li key={idx}>
                        Product ID: <code>{item.product?._id || item.product || 'Standard Product'}</code> — Quantity: <strong>{item.qty} units</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-action-row">
                {inquiry.status === 'pending' ? (
                  <>
                    <button
                      className="approve-action-btn"
                      onClick={() => handleApprove(inquiry._id, inquiry.userEmail)}
                      disabled={actionLoadingId === inquiry._id}
                    >
                      {actionLoadingId === inquiry._id ? 'Approving...' : '✅ Approve Inquiry & Upgrade User to Wholesale'}
                    </button>

                    <button
                      className="reject-action-btn"
                      onClick={() => handleReject(inquiry._id)}
                      disabled={actionLoadingId === inquiry._id}
                    >
                      ❌ Reject
                    </button>
                  </>
                ) : (
                  <span className="action-completed-tag">
                    Action Completed ({inquiry.status.toUpperCase()})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
