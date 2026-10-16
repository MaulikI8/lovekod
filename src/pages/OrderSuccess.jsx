import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { DiyaIcon, WhatsAppIcon, CheckIcon, ArrowRightIcon } from '../components/Icons';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { orders } = useStore();

  const order = orders.find(o => o.id === orderId);

  const getWaConfirmationLink = () => {
    if (!order) return 'https://wa.me/9779800000000';
    const itemsText = order.items.map(i => `${i.name} (Size: ${i.size}, Qty: ${i.quantity})`).join(', ');
    const text = encodeURIComponent(
      `Namaste LoveKod!\n\nI just placed an order!\n\nOrder ID: ${order.id}\nCustomer: ${order.customer?.fullName}\nPhone: ${order.customer?.phone}\nAddress: ${order.customer?.address}, ${order.customer?.city}, ${order.customer?.district}\nPayment: ${order.customer?.paymentMethod}\nTotal: Rs. ${order.total.toLocaleString()}\n\nItems:\n${itemsText}\n\nPlease confirm my Tihar delivery!`
    );
    return `https://wa.me/9779800000000?text=${text}`;
  };

  return (
    <div className="success-page">
      <div className="success-icon-wrap">
        <DiyaIcon size={44} active={true} />
      </div>
      <h2>Dhanyabad! Order Received</h2>
      <p className="success-sub">Thank you for choosing LoveKod for your Tihar celebrations.</p>
      <p className="success-highlight">Your festive attire is being prepared with utmost care and devotion.</p>

      <div className="order-id-display">
        <span className="order-id-label">Official Order Reference:</span>
        <span className="order-id-code tabular-num">{orderId}</span>
      </div>

      {order && (
        <div className="order-receipt-card">
          <div className="receipt-header">
            <h4>Order Summary</h4>
            <span className="receipt-status-pill">
              <CheckIcon size={14} />
              <span>{order.status}</span>
            </span>
          </div>

          <div className="receipt-meta-grid">
            <div>
              <span className="meta-label">Customer Name:</span>
              <strong>{order.customer?.fullName}</strong>
            </div>
            <div>
              <span className="meta-label">Contact Number:</span>
              <strong>{order.customer?.phone}</strong>
            </div>
            <div>
              <span className="meta-label">Destination:</span>
              <strong>{order.customer?.city}, {order.customer?.district}</strong>
            </div>
            <div>
              <span className="meta-label">Payment Method:</span>
              <strong>{order.customer?.paymentMethod}</strong>
            </div>
          </div>

          <div className="receipt-items-list">
            <div className="receipt-items-heading">Reserved Items:</div>
            {order.items.map((it, idx) => (
              <div key={idx} className="receipt-item-line">
                <span>{it.name} (Size: {it.size}) × {it.quantity}</span>
                <span className="receipt-item-price tabular-num">
                  Rs. {(it.price * it.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="receipt-total-row">
            <span>Total Payable Amount</span>
            <span className="receipt-total-num tabular-num">Rs. {order.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="success-actions-column">
        <a
          href={getWaConfirmationLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary-marigold btn-wa-confirm"
        >
          <WhatsAppIcon size={20} />
          <span>Confirm Immediately via WhatsApp</span>
        </a>

        <Link to="/" className="btn-secondary-outline">
          <span>Return to Storefront</span>
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>
  );
}
