import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Checkout.css';

export default function Wholesale({ navigate }) {
  const { user, login, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: user?.name || '',
    phone: '',
    city: '',
    userEmail: user?.email || '',
  });

  const [requestedItems, setRequestedItems] = useState([
    { product: '', qty: 10 },
  ]);

  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Auto-fill user information when user login status changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contactPerson: prev.contactPerson || user.name || '',
        userEmail: user.email || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        userEmail: '',
      }));
    }
  }, [user]);

  // Fetch available products from GET /api/products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          // Set initial default product selection
          setRequestedItems([
            { product: data[0]._id || data[0].id, qty: 10 },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch products for dropdown:', err);
      } finally {
        setFetchingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setRequestedItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = {
        ...updated[index],
        [field]: field === 'qty' ? Math.max(1, parseInt(value) || 1) : value,
      };
      return updated;
    });
  };

  const addItemRow = () => {
    const defaultProdId = products[0]?._id || '';
    setRequestedItems((prev) => [...prev, { product: defaultProdId, qty: 10 }]);
  };

  const removeItemRow = (index) => {
    if (requestedItems.length === 1) return;
    setRequestedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.businessName.trim() || !formData.contactPerson.trim() || !formData.phone.trim()) {
      setErrorMsg('Business Name, Contact Person, and Phone are required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        businessName: formData.businessName.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        requestedItems: requestedItems.map((i) => ({
          product: i.product || undefined,
          qty: Number(i.qty) || 1,
        })),
        userEmail: user ? user.email : (formData.userEmail.trim() || undefined),
      };

      const response = await fetch('/api/bulk-inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit bulk inquiry');
      }

      setSuccessMsg({
        id: result._id,
        businessName: result.businessName,
        userEmail: result.userEmail || '(Submitted Logged Out - No Email Attached)',
      });

      // Reset form
      setFormData({
        businessName: '',
        contactPerson: user?.name || '',
        phone: '',
        city: '',
        userEmail: user?.email || '',
      });

    } catch (err) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <header className="checkout-header">
        <h1>Wholesale & Bulk Orders</h1>
        <p>Submit a bulk inquiry for factory direct pricing</p>
      </header>

      {/* Auth Toggle Bar for Quick Testing */}
      <div className="auth-test-bar">
        <span className="auth-status">
          Auth Status: <strong>{user ? `Logged In as ${user.email}` : 'Logged Out (Public Guest)'}</strong>
        </span>
        {user ? (
          <button className="auth-toggle-btn" onClick={() => logout()}>
            🔒 Log Out (Test Public Mode)
          </button>
        ) : (
          <button className="auth-toggle-btn active" onClick={() => login()}>
            🔑 Log In as Aimal (Test Auto-Fill & Email Included)
          </button>
        )}
      </div>

      {errorMsg && <div className="checkout-error-alert">{errorMsg}</div>}

      {successMsg && (
        <div className="wholesale-success-box">
          <div className="success-icon">✓</div>
          <h2>Bulk Inquiry Submitted Successfully!</h2>
          <p>Inquiry ID: <code>{successMsg.id}</code></p>
          <p>Business Name: <strong>{successMsg.businessName}</strong></p>
          <p>Attached Email: <strong>{successMsg.userEmail}</strong></p>
          <span className="badge badge-success">Pending Admin Approval</span>
        </div>
      )}

      <div className="checkout-wrapper">
        <div className="checkout-card">
          <h2>Bulk Order Application Form</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="businessName">Business Name *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  placeholder="e.g. Aljannat Retail & Distribution"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person Name *</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  placeholder="Full Name"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="03XXXXXXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="e.g. Lahore, Karachi, Peshawar"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Email field auto-filled or editable */}
            <div className="form-group">
              <label htmlFor="userEmail">
                Account Email {user ? '(Auto-filled from AuthContext)' : '(Optional for Guests)'}
              </label>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                placeholder="name@business.com"
                value={formData.userEmail}
                onChange={handleInputChange}
                readOnly={!!user}
                className={user ? 'read-only-input' : ''}
              />
            </div>

            {/* Repeatable List of Requested Items */}
            <div className="requested-items-section">
              <div className="section-title-row">
                <h3>Requested Bulk Items</h3>
                <button type="button" className="add-item-row-btn" onClick={addItemRow}>
                  + Add Product Row
                </button>
              </div>

              {requestedItems.map((item, idx) => (
                <div key={idx} className="item-row">
                  <div className="form-group flex-2">
                    <label>Select Product (Fetched from GET /api/products):</label>
                    <select
                      value={item.product}
                      onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                    >
                      {fetchingProducts ? (
                        <option>Loading products...</option>
                      ) : (
                        products.map((p) => (
                          <option key={p._id || p.id} value={p._id || p.id}>
                            {p.name} (PKR {p.price.toLocaleString()})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      required
                    />
                  </div>

                  {requestedItems.length > 1 && (
                    <button
                      type="button"
                      className="remove-row-btn"
                      onClick={() => removeItemRow(idx)}
                      title="Remove Row"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Submitting Inquiry...' : 'Submit Wholesale Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
