import React from 'react';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', cls: 'badge-pending', dot: '#f59e0b' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-confirmed', dot: '#3b82f6' },
  PROCESSING: { label: 'Processing', cls: 'badge-processing', dot: '#8b5cf6' },
  SHIPPED: { label: 'Shipped', cls: 'badge-shipped', dot: '#06b6d4' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'badge-out_for_delivery', dot: '#f97316' },
  DELIVERED: { label: 'Delivered', cls: 'badge-delivered', dot: '#10b981' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled', dot: '#ef4444' },
  RETURNED: { label: 'Returned', cls: 'badge-returned', dot: '#9ca3af' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge-pending', dot: '#94a3b8' };
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}
