import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getAllOrders } from '../../services/orderService';
import { ShoppingCart, TrendingUp, Clock, Truck, CheckCircle, XCircle, DollarSign, PlusCircle } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{
      width: 48, height: 48, borderRadius: '12px',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, o] = await Promise.all([getDashboardStats(), getAllOrders()]);
      setStats(s.data);
      setRecentOrders((o.data || []).slice(0, 6));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="loading-spinner"><div className="spinner" /></div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your order management system</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">
          <PlusCircle size={16} />
          <span className="btn-label">Place New Order</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={ShoppingCart} label="Total Orders"  value={stats?.totalOrders ?? 0}        color="var(--accent)"   bg="var(--accent-light)" />
        <StatCard icon={Clock}        label="Pending"       value={stats?.pendingOrders ?? 0}      color="var(--warning)"  bg="var(--warning-light)" />
        <StatCard icon={TrendingUp}   label="Processing"    value={stats?.processingOrders ?? 0}   color="var(--purple)"   bg="var(--purple-light)" />
        <StatCard icon={Truck}        label="Shipped"       value={stats?.shippedOrders ?? 0}      color="#06b6d4"         bg="rgba(6,182,212,0.1)" />
        <StatCard icon={CheckCircle}  label="Delivered"     value={stats?.deliveredOrders ?? 0}    color="var(--success)"  bg="var(--success-light)" />
        <StatCard icon={XCircle}      label="Cancelled"     value={stats?.cancelledOrders ?? 0}    color="var(--danger)"   bg="var(--danger-light)" />
        <StatCard icon={DollarSign}   label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} color="var(--success)" bg="var(--success-light)" />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Orders</h2>
          <Link to="/orders" className="btn btn-outline btn-sm">View All</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <h3>No orders yet</h3>
            <p>Place your first order to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Customer</th>
                  <th className="hide-mobile">Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="hide-mobile">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><code style={{ fontSize: '12px', color: 'var(--accent)' }}>{order.trackingNumber}</code></td>
                    <td><strong>{order.customerName}</strong></td>
                    <td className="hide-mobile">{order.productName}</td>
                    <td><strong>${order.totalAmount?.toFixed(2)}</strong></td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none; }
          .btn-label { display: none; }
        }
      `}</style>
    </div>
  );
}
