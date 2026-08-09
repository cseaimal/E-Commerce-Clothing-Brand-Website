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

  const addToCart = (productToAdd) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) =>
          i.product === (productToAdd.product || productToAdd._id) &&
          i.variant?.size === productToAdd.variant?.size &&
          i.variant?.color === productToAdd.variant?.color
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].qty += productToAdd.qty || 1;
        return updated;
      }
      return [
        ...prevCart,
        {
          product: productToAdd.product || productToAdd._id,
          name: productToAdd.name,
          variant: productToAdd.variant || { size: 'Standard', color: 'Default' },
          qty: productToAdd.qty || 1,
          price: productToAdd.price || 0,
          image: productToAdd.image,
        },
      ];
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, qty) => {
    if (qty <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated[index].qty = qty;
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
        cart,
        cartItems: cart,
        items: cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clear,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
