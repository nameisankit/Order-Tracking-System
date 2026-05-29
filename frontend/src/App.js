import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import OrderList from './components/OrderList/OrderList';
import OrderForm from './components/OrderForm/OrderForm';
import OrderDetail from './components/OrderDetail/OrderDetail';
import TrackOrder from './components/OrderDetail/TrackOrder';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import { useWebSocket } from './hooks/useWebSocket';
import { isAuthenticated } from './services/authService';
import './index.css';

function AppContent() {
  const [wsConnected, setWsConnected] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [notification, setNotification] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const handleNotification = useCallback((notif) => {
    setNotification(notif);
    setRefreshTick(t => t + 1);

    // Show toast
    const icon = notif.type === 'ORDER_CREATED' ? '🛒' : notif.type === 'STATUS_UPDATED' ? '🔄' : '📦';
    toast(notif.message, {
      icon,
      style: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
      },
      duration: 5000,
    });

    // Auto-dismiss notification banner
    setTimeout(() => setNotification(null), 6000);
    setWsConnected(true);
  }, []);

  useWebSocket(handleNotification);

  return (
    <div className="app-layout">
      <Navbar wsConnected={wsConnected} authenticated={authenticated} setAuthenticated={setAuthenticated} />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
          <Route path="/register" element={<Register setAuthenticated={setAuthenticated} />} />
          <Route path="/track" element={<TrackOrder />} />
          {authenticated ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<OrderList onRefresh={refreshTick} />} />
              <Route path="/orders/new" element={<OrderForm />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/orders/:id/edit" element={<OrderForm />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </main>

      {/* Live WebSocket notification banner */}
      {notification && (
        <div className="ws-notification">
          <div className="notif-title">
            {notification.type === 'ORDER_CREATED' ? '🛒 New Order' : '🔄 Order Updated'}
          </div>
          <div className="notif-body">{notification.message}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {notification.trackingNumber} · {new Date(notification.timestamp).toLocaleTimeString()}
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{
              position: 'absolute', top: '8px', right: '12px',
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '16px'
            }}
          >×</button>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
