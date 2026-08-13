import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import Wholesale from './pages/Wholesale';
import AdminInquiries from './pages/AdminInquiries';
import './styles/Checkout.css';

function MainApp() {
  const [route, setRoute] = useState(
    window.location.pathname === '/' ? '/catalog' : window.location.pathname || '/catalog'
  );
  const { user } = useAuth();
  const { cartCount } = useCart();

  const navigate = (path) => {
    setRoute(path);
    if (window.history) {
      window.history.pushState({}, '', path);
    }
  };

  const isConfirmation = route.startsWith('/order-confirmation');
  const isProductDetail = route.startsWith('/product');
  const orderIdFromPath = isConfirmation ? route.split('/').pop() : '';
  const productIdFromPath = isProductDetail ? route.split('/').pop() : '';

  return (
    <div>
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="navbar-logo" onClick={() => navigate('/catalog')}>
          ALJANNAT <span>BOUTIQUE</span>
        </div>
        <div className="navbar-links">
          <button className={`nav-btn ${route === '/catalog' ? 'active' : ''}`} onClick={() => navigate('/catalog')}>
            🛍️ Products
          </button>
          <button className={`nav-btn ${route.startsWith('/product') ? 'active' : ''}`} onClick={() => navigate('/product/64f1a2b3c4d5e6f7a8b9c0a1')}>
            🔍 Product Detail (MOQ Test)
          </button>
          <button className={`nav-btn ${route === '/wholesale' ? 'active' : ''}`} onClick={() => navigate('/wholesale')}>
            🏢 Wholesale Form
          </button>
          <button className={`nav-btn ${route === '/admin/inquiries' ? 'active' : ''}`} onClick={() => navigate('/admin/inquiries')}>
            🛠️ Admin Inquiries
          </button>
          <button className={`nav-btn ${route === '/orders' ? 'active' : ''}`} onClick={() => navigate('/orders')}>
            📜 My Orders
          </button>
          <button className={`nav-btn ${route === '/cart' ? 'active' : ''}`} onClick={() => navigate('/cart')}>
            🛒 Cart ({cartCount})
          </button>
          <div className="user-badge">
            👤 {user ? `${user.name} (${user.role.toUpperCase()})` : 'Guest'}
          </div>
        </div>
      </nav>

      {/* Page Routing */}
      <main>
        {isConfirmation ? (
          <OrderConfirmation orderId={orderIdFromPath} navigate={navigate} />
        ) : isProductDetail ? (
          <ProductDetail productId={productIdFromPath} navigate={navigate} />
        ) : route === '/admin/inquiries' ? (
          <AdminInquiries navigate={navigate} />
        ) : route === '/wholesale' ? (
          <Wholesale navigate={navigate} />
        ) : route === '/orders' ? (
          <OrderHistory navigate={navigate} />
        ) : route === '/checkout' ? (
          <Checkout navigate={navigate} />
        ) : route === '/cart' ? (
          <Cart navigate={navigate} />
        ) : (
          <ProductCatalog navigate={navigate} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
