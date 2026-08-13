import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/ProductListing.css';

export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data || []);
    } catch (e) {
      // ignore — categories may be in-memory or endpoint unavailable
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (category) params.category = category;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const res = await axios.get('/api/products', { params });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, minPrice, maxPrice]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="pl-container">
      <h2 className="pl-title">Products</h2>

      <div className="pl-filters">
        <div className="pl-filter">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id || c.name} value={c.name || c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="pl-filter pl-price-range">
          <label>Price Range</label>
          <div className="pl-price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="pl-price-sep">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="pl-filter">
          <button className="pl-refresh" onClick={() => fetchProducts()}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="pl-spinner" aria-label="loading" />
      ) : error ? (
        <div className="pl-empty">Error: {error}</div>
      ) : products.length === 0 ? (
        <div className="pl-empty">No products match your filters.</div>
      ) : (
        <div className="pl-grid">
          {products.map((p) => (
            <div key={p._id || p.name} className="pl-card">
              <div className="pl-image-wrap">
                <img
                  src={(p.images && p.images[0]) || p.image || 'https://placehold.co/400x500'}
                  alt={p.name}
                />
              </div>
              <div className="pl-meta">
                <div className="pl-name">{p.name}</div>
                <div className="pl-price">{typeof p.price === 'number' ? 'Rs ' + p.price : p.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
