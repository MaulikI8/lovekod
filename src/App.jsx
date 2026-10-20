import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Skiper8Preloader from './components/ui/skiper-ui/skiper8';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';

// Store Merchant Admin Portal
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminContent from './pages/admin/AdminContent';
import AdminTestimonials from './pages/admin/AdminTestimonials';

import './index.css';

export default function App() {
  const [showPreloader, setShowPreloader] = useState(() => {
    try {
      return !sessionStorage.getItem('lovekod_preloader_seen');
    } catch {
      return false;
    }
  });

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    try {
      sessionStorage.setItem('lovekod_preloader_seen', 'true');
    } catch {}
  };

  return (
    <StoreProvider>
      <ToastProvider>
        {showPreloader && <Skiper8Preloader onComplete={handlePreloaderComplete} />}
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Merchant Admin Portal (Custom Blanxer-style E-commerce Suite) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
            </Route>

            {/* Customer Storefront Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              {/* Custom 404 handler */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
