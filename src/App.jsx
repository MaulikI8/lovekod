import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            {/* Custom 404 handler */}
            <Route path="*" element={<NotFound />} />
            {/* Any /admin requests redirect to home */}
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
          </ToastProvider>
    </StoreProvider>
  );
}
