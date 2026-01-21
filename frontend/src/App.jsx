import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import Cart from './pages/Cart/Cart.jsx'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder.jsx'
import ProductDetail from './pages/ProductDetail/ProductDetail.jsx'
import MyOrders from './pages/MyOrders/MyOrders.jsx'
import Address from './pages/Address/Address.jsx'
import Payment from './pages/Payment/Payment.jsx'
import SearchResults from './pages/SearchResults/SearchResults.jsx'
import StoreContextProvider from './Context/StoreContext.jsx' 

const App = () => {
  return (
    <StoreContextProvider>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search/:query" element={<SearchResults />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/address" element={<Address />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </div>
    </StoreContextProvider>
  )
}

export default App