import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, PlusCircle, Search, Wifi, LogOut, LogIn
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
  const user = getUser();

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    navigate('/login');
  };

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, height: '100vh', width: '260px',
      background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 100, padding: '24px 0'
    }}>
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
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                marginBottom: '4px',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))
        ) : (
          <NavLink
            to="/track"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              marginBottom: '4px',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-light)' : 'transparent',
              transition: 'all 0.15s ease',
            })}
          >
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
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--accent-light)';
              e.target.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--bg-card-hover)';
              e.target.style.color = 'var(--text-secondary)';
            }}
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        nav a:hover:not(.active) {
          background: var(--bg-card-hover) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </aside>
  );
}
