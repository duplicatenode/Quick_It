import React, { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import './Address.css'

const Address = () => {
  const { getTotalCartAmount, user, token } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'India',
    phone: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in and cart has items
  useEffect(() => {
    if (!user || !token) {
      alert('Please login to place an order');
      navigate('/');
      return;
    }
    
    const totalAmount = getTotalCartAmount();
    if (totalAmount === 0) {
      // Cart is empty - redirect to home instead of showing alert
      navigate('/');
      return;
    }
    
    // Pre-fill user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user, token, navigate, getTotalCartAmount]);

  const totalAmount = getTotalCartAmount();
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const platformFee = 5;
  const gst = Math.round(totalAmount * 0.05); // 5% GST
  const finalTotal = totalAmount + deliveryFee + platformFee + gst;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields');
      return;
    }

    // Store address data in localStorage for payment page
    localStorage.setItem('deliveryAddress', JSON.stringify(formData));
    
    // Navigate to payment page
    navigate('/payment');
  };

  if (!user || !token) {
    return (
      <div className="empty-cart">
        <h2>Please login to place an order</h2>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Go to Home
        </button>
      </div>
    );
  }

  if (totalAmount === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="address-page">
      <div className="address-container">
        <div className="address-left">
          <h2>Delivery Address</h2>
          
          <form onSubmit={handleSubmit} className="address-form">
            <div className="multi-fields">
              <input
                name="firstName"
                onChange={handleInputChange}
                value={formData.firstName}
                type="text"
                placeholder="First name"
                required
                disabled={isLoading}
              />
              <input
                name="lastName"
                onChange={handleInputChange}
                value={formData.lastName}
                type="text"
                placeholder="Last name"
                required
                disabled={isLoading}
              />
            </div>
            
            <input
              name="email"
              onChange={handleInputChange}
              value={formData.email}
              type="email"
              placeholder="Email address"
              required
              disabled={isLoading}
            />
            
            <input
              name="street"
              onChange={handleInputChange}
              value={formData.street}
              type="text"
              placeholder="Street address"
              required
              disabled={isLoading}
            />
            
            <div className="multi-fields">
              <input
                name="city"
                onChange={handleInputChange}
                value={formData.city}
                type="text"
                placeholder="City"
                required
                disabled={isLoading}
              />
              <input
                name="state"
                onChange={handleInputChange}
                value={formData.state}
                type="text"
                placeholder="State"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="multi-fields">
              <input
                name="zipcode"
                onChange={handleInputChange}
                value={formData.zipcode}
                type="text"
                placeholder="Pin code"
                required
                disabled={isLoading}
              />
              <input
                name="country"
                onChange={handleInputChange}
                value={formData.country}
                type="text"
                placeholder="Country"
                disabled={isLoading}
              />
            </div>
            
            <input
              name="phone"
              onChange={handleInputChange}
              value={formData.phone}
              type="tel"
              placeholder="Phone number"
              required
              disabled={isLoading}
            />

            <div className="address-buttons">
              <button 
                type="button" 
                onClick={() => navigate('/cart')} 
                className="back-button"
              >
                Back to Cart
              </button>
              <button type="submit" className="continue-button">
                Continue to Payment
              </button>
            </div>
          </form>
        </div>
        
        <div className="address-right">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <p>Subtotal</p>
                <p>₹{totalAmount}</p>
              </div>
              <div className="summary-row">
                <p>Delivery Fee</p>
                <p>₹{deliveryFee}</p>
              </div>
              <div className="summary-row">
                <p>Platform Fee</p>
                <p>₹{platformFee}</p>
              </div>
              <div className="summary-row">
                <p>GST (5%)</p>
                <p>₹{gst}</p>
              </div>
              <hr />
              <div className="summary-row total">
                <strong>Total</strong>
                <strong>₹{finalTotal}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Address