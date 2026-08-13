import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('aljannat_cart');
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('aljannat_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const addToCart = (item) => {
    // item: { productId, name, price, variant, qty, image }
    const normalized = {
      product: item.productId || item.product || item._id,
      name: item.name,
      variant: item.variant || { size: 'Standard', color: 'Default' },
      qty: item.qty || 1,
      price: item.price || 0,
      image: item.image,
    };
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) => i.product === normalized.product && JSON.stringify(i.variant) === JSON.stringify(normalized.variant)
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].qty += normalized.qty;
        return updated;
      }
      return [...prevCart, normalized];
    });
  };

  const removeFromCart = (indexOrProduct, variant) => {
    // support remove by index (legacy) or by productId + variant
    if (typeof indexOrProduct === 'number') {
      setCart((prevCart) => prevCart.filter((_, i) => i !== indexOrProduct));
      return;
    }
    const productId = indexOrProduct;
    setCart((prevCart) => prevCart.filter((it) => !(it.product === productId && JSON.stringify(it.variant) === JSON.stringify(variant))));
  };

  const updateQuantity = (indexOrProduct, qtyOrVariant, maybeQty) => {
    // two call styles supported:
    // updateQuantity(index, qty)
    // updateQuantity(productId, variant, qty)
    if (typeof indexOrProduct === 'number') {
      const idx = indexOrProduct;
      const qty = qtyOrVariant;
      if (qty <= 0) {
        removeFromCart(idx);
        return;
      }
      setCart((prevCart) => {
        const updated = [...prevCart];
        updated[idx].qty = qty;
        return updated;
      });
      return;
    }

    const productId = indexOrProduct;
    const variant = qtyOrVariant;
    const qty = maybeQty;
    if (qty <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart((prevCart) => {
      const updated = prevCart.map((it) => {
        if (it.product === productId && JSON.stringify(it.variant) === JSON.stringify(variant)) {
          return { ...it, qty };
        }
        return it;
      });
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('aljannat_cart');
    } catch (e) {}
  };

  const clear = clearCart;

  const cartTotal = cart.reduce((total, item) => total + (item.price || 0) * (item.qty || 1), 0);
  const cartCount = cart.reduce((count, item) => count + (item.qty || 1), 0);

  return (
    <CartContext.Provider
      value={{
        items: cart,
        cart,
        cartItems: cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clear,
        total: cartTotal,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
