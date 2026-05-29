import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllOrders, deleteOrder, updateOrderStatus
} from '../../services/orderService';
import { PlusCircle, RefreshCw, Trash2, Eye, Edit2 } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import toast from 'react-hot-toast';

const ALL_STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'
];

export default function OrderList({ onRefresh }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [editingStatus, setEditingStatus] = useState(null); // order id

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Allow parent (App) to trigger reload on WS notification
  useEffect(() => {
    if (onRefresh) load();
  }, [onRefresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      setEditingStatus(null);
      load();
    } catch { toast.error('Status update failed'); }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'ALL' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      o.trackingNumber.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
          <Link to="/orders/new" className="btn btn-primary">
            <PlusCircle size={15} /> New Order
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ maxWidth: '280px' }}
          placeholder="Search by name, email, product..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: '180px' }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <h3>No orders found</h3>
          <p>Try adjusting your filters or place a new order</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tracking #</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>#{order.id}</td>
                  <td>
                    <code style={{ fontSize: '12px', color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 6px', borderRadius: '4px' }}>
                      {order.trackingNumber}
                    </code>
                  </td>
                  <td>
                    <div><strong>{order.customerName}</strong></div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                  </td>
                  <td>{order.productName}</td>
                  <td style={{ textAlign: 'center' }}>{order.quantity}</td>
                  <td><strong>${order.totalAmount?.toFixed(2)}</strong></td>
                  <td>
                    {editingStatus === order.id ? (
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                        defaultValue={order.status}
                        autoFocus
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => setEditingStatus(order.id)}
                        title="Click to change status"
                      >
                        <StatusBadge status={order.status} />
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn btn-outline btn-sm"
                        title="View detail"
                      >
                        <Eye size={13} />
                      </Link>
                      <Link
                        to={`/orders/${order.id}/edit`}
                        className="btn btn-outline btn-sm"
                        title="Edit order"
                      >
                        <Edit2 size={13} />
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(order.id)}
                        title="Delete order"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
