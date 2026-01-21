import React, { createContext, useState, useEffect } from "react";
import { prod_list } from "../assets/assets";

export const StoreContext = createContext({ prod_list: [] });

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : {};
  });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = 'http://localhost:8000/api';

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Check if user is logged in on app start
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  // API call to get user profile
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        // Token might be expired
        logout();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  // Register function
  const register = async (name, email, password, phone = '') => {
    try {
      console.log('Attempting to register with API URL:', `${API_URL}/users/register`);
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, phone })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Registration failed - Connection error' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    setToken(null);
    setUser(null);
    setCartItems({});
  };

  // Add item to cart
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  // Remove item from cart
  const removeFromCart = (itemId, removeAll = false) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (removeAll || newCart[itemId] === 1) {
        delete newCart[itemId];
      } else if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      }
      return newCart;
    });
  };

  // Get total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = prod_list.find((product) => product._id === itemId);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId];
        }
      }
    }
    return totalAmount;
  };

  // Get total items count
  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const itemId in cartItems) {
      totalItems += cartItems[itemId];
    }
    return totalItems;
  };

  // Place order function
  const placeOrder = async (orderData) => {
    try {
      console.log('=== PLACE ORDER DEBUG ===');
      console.log('Cart items:', cartItems);
      console.log('Cart items keys:', Object.keys(cartItems));
      console.log('Total cart amount:', getTotalCartAmount());
      
      // Check if cart has items
      if (Object.keys(cartItems).length === 0 || getTotalCartAmount() === 0) {
        console.log('Cart is empty - no items or zero amount');
        return { success: false, message: 'Cart is empty' };
      }

      // Prepare order items from cart
      const orderItems = Object.keys(cartItems).map(itemId => {
        console.log(`Processing item ID: ${itemId}`);
        const product = prod_list.find(p => p._id === itemId);
        console.log(`Found product:`, product);
        if (!product) {
          console.warn(`Product not found for ID: ${itemId}`);
          return null;
        }
        const orderItem = {
          productId: itemId,
          quantity: cartItems[itemId],
          price: product.price
        };
        console.log(`Created order item:`, orderItem);
        return orderItem;
      }).filter(item => item !== null);

      console.log('Final order items:', orderItems);

      if (orderItems.length === 0) {
        console.log('No valid order items found');
        return { success: false, message: 'No valid items in cart' };
      }

      // Calculate totals
      const subtotal = getTotalCartAmount();
      const deliveryFee = subtotal > 500 ? 0 : 40;
      const platformFee = 5;
      const gst = Math.round(subtotal * 0.05);
      const total = subtotal + deliveryFee + platformFee + gst;

      const fullOrderData = {
        items: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        totalAmount: total,
        notes: orderData.notes || ''
      };

      console.log('Placing order with data:', fullOrderData);

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fullOrderData)
      });

      const data = await response.json();
      console.log('Order response:', data);
      
      if (data.success) {
        // Clear cart after successful order
        setCartItems({});
        localStorage.removeItem('cartItems');
        // Unwrap order object from data
        const order = data.data?.order || data.data;
        return { success: true, order };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Place order error:', error);
      return { success: false, message: 'Failed to place order' };
    }
  };

  // Get user orders function
  const getUserOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const orders = data.data?.orders || [];
        return { success: true, orders };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get orders error:', error);
      return { success: false, message: 'Failed to fetch orders' };
    }
  };

  const contextValue = {
    prod_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    user,
    token,
    login,
    register,
    logout,
    placeOrder,
    getUserOrders,
    API_URL,
    searchQuery,
    setSearchQuery
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;