import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBagIcon, CloseIcon, TruckIcon, ArrowRightIcon } from './Icons';

export default function CartDrawer() {
  const { cart, products, cartOpen, setCartOpen, cartTotal, cartCount, updateCartQty, removeFromCart, siteSettings } = useStore();
  const navigate = useNavigate();

  const getProduct = (id) => products.find(p => p.id === id);
  const freeShippingThreshold = siteSettings?.freeShippingThreshold || 3000;
  const amountNeeded = freeShippingThreshold - cartTotal;
  const progressPct = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  return (
    <div
      className={`cart-backdrop ${cartOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}
      aria-hidden={!cartOpen}
    >
      <div className="cart-drawer" role="dialog" aria-label="Shopping Bag">
        <div className="cart-head">
          <div className="cart-head-title">
            <ShoppingBagIcon size={20} />
            <h3>Shopping Bag ({cartCount})</h3>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        {cartCount > 0 && (
          <div className="cart-meter-wrap">
            <div className="cart-meter-text">
              <TruckIcon size={16} />
              {amountNeeded > 0 ? (
                <span>Add <strong>Rs. {amountNeeded.toLocaleString()}</strong> more for free nationwide delivery!</span>
              ) : (
                <span className="free-unlocked">Tihar Gift: You unlocked FREE delivery across Nepal!</span>
              )}
            </div>
            <div className="cart-meter-track">
              <div
                className="cart-meter-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingBagIcon size={48} />
              </div>
              <h4>Your Festive Bag is Empty</h4>
              <p>Explore our limited-edition Tihar kurthas and handpick your festive look.</p>
              <button
                type="button"
                className="btn-primary-marigold"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/#collection');
                }}
              >
                <span>View Kurtha Collection</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          ) : (
            cart.map(item => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <div key={`${item.productId}-${item.size}`} className="cart-item">
                  <img src={product.image} alt={product.name} />
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{product.name}</h4>
                    <div className="cart-item-meta">
                      <span>Size: <strong>{item.size}</strong></span>
                      <span className="dot">•</span>
                      <span>{product.fabricType}</span>
                    </div>
                    <div className="cart-item-price tabular-num">
                      Rs. {(product.price * item.quantity).toLocaleString()}
                    </div>
                    <div className="cart-item-bottom">
                      <div className="qty-ctrl" aria-label="Quantity control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateCartQty(item.productId, item.size, -1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateCartQty(item.productId, item.size, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeFromCart(item.productId, item.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-row">
              <span>Subtotal</span>
              <span className="tabular-num">Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <div className="cart-row">
              <span>Delivery</span>
              <span>{cartTotal >= freeShippingThreshold ? <strong className="free-text">FREE</strong> : 'Rs. 150'}</span>
            </div>
            <div className="cart-total">
              <span>Estimated Total</span>
              <span className="tabular-num">Rs. {(cartTotal + (cartTotal >= freeShippingThreshold ? 0 : 150)).toLocaleString()}</span>
            </div>
            <button
              type="button"
              className="btn-checkout"
              onClick={() => {
                setCartOpen(false);
                navigate('/checkout');
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRightIcon size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
