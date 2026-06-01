import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, PlusCircle, Search, Wifi, LogOut, Menu, X, Package
} from 'lucide-react';
import { logout, getUser } from '../../services/authService';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: ShoppingCart, label: 'All Orders' },
  { to: '/orders/new', icon: PlusCircle, label: 'Place Order' },
  { to: '/track', icon: Search, label: 'Track Order' },
];

export default function Navbar({ wsConnected, authenticated, setAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    textDecoration: 'none', fontSize: '14px', fontWeight: 500,
    marginBottom: '4px',
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-light)' : 'transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-logo">
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={16} color="white" />
          </div>
          OrderTrack
        </div>
        <button
          className={`hamburger ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Overlay ── */}
      <div
        className={`nav-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside
        className={mobileOpen ? 'mobile-open' : ''}
        style={{
          position: 'fixed', left: 0, top: 0, height: '100vh', width: '260px',
          background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', zIndex: 150, padding: '24px 0',
          transition: 'left 0.3s ease',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>📦</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                OrderTrack
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Management System
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {authenticated ? (
            navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'} style={navLinkStyle}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))
          ) : (
            <NavLink to="/track" style={navLinkStyle}>
              <Search size={18} />
              Track Order
            </NavLink>
          )}
        </nav>

        {/* User info and logout */}
        {authenticated && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {user?.username || 'User'}
              </div>
              <div style={{ fontSize: '11px' }}>{user?.email || ''}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        {/* WebSocket status */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wifi size={14} color={wsConnected ? 'var(--success)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '12px', color: wsConnected ? 'var(--success)' : 'var(--text-muted)' }}>
              {wsConnected ? 'Live updates ON' : 'Connecting...'}
            </span>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: wsConnected ? 'var(--success)' : 'var(--text-muted)',
              marginLeft: 'auto',
              boxShadow: wsConnected ? '0 0 6px var(--success)' : 'none',
              animation: wsConnected ? 'pulse 2s infinite' : 'none'
            }} />
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        nav a:hover {
          background: var(--bg-card-hover) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </>
  );
}
