import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import Toast from './Toast';
import CookieConsent from './ui/CookieConsent';

export default function Layout() {
  return (
    <div className="site-wrapper">
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
      <CookieConsent />
    </div>
  );
}
