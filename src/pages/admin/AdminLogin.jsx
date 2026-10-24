import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin, isAdmin } = useStore();
  const navigate = useNavigate();

  if (isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminLogin(password)) {
      navigate('/admin');
    } else {
      setError('Incorrect admin passcode. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--night-card)', border: '1px solid var(--night-border)',
        borderRadius: 'var(--radius-lg)', padding: '36px', maxWidth: '400px', width: '100%',
        boxShadow: 'var(--shadow-card)', textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <img src="/images/logo.jpg" alt="LoveKod" style={{ height: '56px', borderRadius: '4px', margin: '0 auto 12px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.6rem' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>LoveKod Inventory & Order Management</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(231,76,60,0.15)', border: '1px solid var(--danger)',
            color: '#ff7979', padding: '10px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Admin Passcode</label>
            <input
              type="password"
              placeholder=""
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            Access Dashboard →
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
