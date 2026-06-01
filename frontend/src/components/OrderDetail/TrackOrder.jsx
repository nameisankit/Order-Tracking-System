import React, { useState } from 'react';
import { trackOrder } from '../../services/orderService';
import { Search, Package, MapPin } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

const PIPELINE = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED'];

export default function TrackOrder() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await trackOrder(trackingNumber.trim());
      setOrder(res.data);
    } catch {
      setError('Order not found. Please check your tracking number.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? PIPELINE.indexOf(order.status) : -1;

  return (
    <div className="fade-in" style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Track Order</h1>
          <p className="page-subtitle">Enter your tracking number to check delivery status</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px' }}>
          <input
            className="form-input"
            placeholder="Enter tracking number (e.g. TRK1234567890)"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={16} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {order && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header */}
          <div className="card" style={{ background: 'var(--accent-light)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Tracking Number
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {order.trackingNumber}
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </div>

          {/* Progress */}
          {order.status !== 'CANCELLED' && (
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
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: done ? 'var(--accent)' : 'var(--bg-primary)',
                          border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: 700,
                          color: done ? 'white' : 'var(--text-muted)',
                          boxShadow: active ? '0 0 0 4px var(--accent-light)' : 'none',
                          flexShrink: 0
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: '10px', textAlign: 'center', width: '70px', color: done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 600 : 400 }}>
                          {step.replace('_', ' ')}
                        </span>
                      </div>
                      {!isLast && (
                        <div style={{ flex: 1, height: 2, marginBottom: '20px', background: i < currentStep ? 'var(--accent)' : 'var(--border)' }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} /> Order Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                ['Product', order.productName],
                ['Quantity', order.quantity],
                ['Total', `$${order.totalAmount?.toFixed(2)}`],
                ['Placed On', new Date(order.createdAt).toLocaleDateString()],
                ['Est. Delivery', order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'],
                ['Last Updated', new Date(order.updatedAt).toLocaleString()],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {order.shippingAddress && (
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> Shipping To
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{order.shippingAddress}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
