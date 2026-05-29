import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../services/orderService';
import { ArrowLeft, Edit2, Package, MapPin, User, Mail, Calendar, Truck } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import toast from 'react-hot-toast';

const PIPELINE = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = async () => {
    try {
      const res = await getOrderById(id);
      setOrder(res.data);
    } catch {
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      load();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!order) return null;

  const currentStep = PIPELINE.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Details</h1>
          <p className="page-subtitle">
            <code style={{ color: 'var(--accent)', fontSize: '14px' }}>{order.trackingNumber}</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <Link to={`/orders/${id}/edit`} className="btn btn-primary">
            <Edit2 size={15} /> Edit
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Progress timeline */}
          {!isCancelled && (
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '24px' }}>Delivery Progress</h3>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                {PIPELINE.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  const isLast = i === PIPELINE.length - 1;
                  return (
                    <React.Fragment key={step}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: isLast ? 'none' : '1', zIndex: 1 }}>
                        <div
                          style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: done ? 'var(--accent)' : 'var(--bg-primary)',
                            border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 700,
                            color: done ? 'white' : 'var(--text-muted)',
                            boxShadow: active ? '0 0 0 4px var(--accent-light)' : 'none',
                            transition: 'all 0.3s ease', cursor: 'pointer',
                            flexShrink: 0
                          }}
                          onClick={() => handleStatusUpdate(step)}
                          title={`Set to ${step}`}
                        >
                          {done ? '✓' : i + 1}
                        </div>
                        <span style={{
                          fontSize: '10px', textAlign: 'center', width: '70px',
                          color: done ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontWeight: active ? 600 : 400
                        }}>
                          {step.replace('_', ' ')}
                        </span>
                      </div>
                      {!isLast && (
                        <div style={{
                          flex: 1, height: 2, marginBottom: '20px',
                          background: i < currentStep ? 'var(--accent)' : 'var(--border)',
                          transition: 'background 0.3s ease'
                        }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                Click any step to update the order status
              </p>
            </div>
          )}

          {/* Product info */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} /> Product Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                ['Product', order.productName],
                ['Quantity', order.quantity],
                ['Unit Price', `$${order.price?.toFixed(2)}`],
                ['Total Amount', `$${order.totalAmount?.toFixed(2)}`],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          {order.shippingAddress && (
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> Shipping Address
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{order.shippingAddress}</p>
              {order.estimatedDelivery && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                  Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status Card */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Current Status
            </h3>
            <StatusBadge status={order.status} />
            <div style={{ marginTop: '16px' }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Update Status</label>
              <select
                className="form-select"
                disabled={updatingStatus}
                value={order.status}
                onChange={e => handleStatusUpdate(e.target.value)}
              >
                {['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Card */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Customer
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={15} color="var(--text-muted)" />
                <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{order.customerName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={15} color="var(--text-muted)" />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{order.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Dates Card */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Dates
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Placed On</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Last Updated</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {new Date(order.updatedAt).toLocaleString()}
                </div>
              </div>
              {order.estimatedDelivery && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Est. Delivery</div>
                  <div style={{ fontSize: '14px', color: 'var(--success)' }}>
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Number */}
          <div className="card" style={{ background: 'var(--accent-light)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Truck size={15} color="var(--accent)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>Tracking Number</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '1px' }}>
              {order.trackingNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
