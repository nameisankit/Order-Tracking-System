import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrder, updateOrder, getOrderById } from '../../services/orderService';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const empty = {
  customerName: '', customerEmail: '', productName: '',
  quantity: '', price: '', shippingAddress: ''
};

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      getOrderById(id)
        .then(res => {
          const o = res.data;
          setForm({
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            productName: o.productName,
            quantity: o.quantity,
            price: o.price,
            shippingAddress: o.shippingAddress || ''
          });
        })
        .catch(() => toast.error('Order not found'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Required';
    if (!form.customerEmail.trim()) e.customerEmail = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.customerEmail)) e.customerEmail = 'Invalid email';
    if (!form.productName.trim()) e.productName = 'Required';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Must be > 0';
    if (!form.price || Number(form.price) <= 0) e.price = 'Must be > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        quantity: parseInt(form.quantity),
        price: parseFloat(form.price)
      };
      if (isEdit) {
        await updateOrder(id, payload);
        toast.success('Order updated!');
      } else {
        await createOrder(payload);
        toast.success('Order placed successfully!');
      }
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  if (fetching) return <div className="loading-spinner"><div className="spinner" /></div>;

  const total = (Number(form.quantity) || 0) * (Number(form.price) || 0);

  return (
    <div className="fade-in" style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Order' : 'Place New Order'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Update order details below' : 'Fill in the details to place a new order'}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Customer Info */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Customer Information
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  placeholder="John Doe"
                  value={form.customerName}
                  onChange={set('customerName')}
                />
                {errors.customerName && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.customerName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="john@example.com"
                  value={form.customerEmail}
                  onChange={set('customerEmail')}
                />
                {errors.customerEmail && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.customerEmail}</span>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Shipping Address</label>
              <input
                className="form-input"
                placeholder="123 Main St, City, State 12345"
                value={form.shippingAddress}
                onChange={set('shippingAddress')}
              />
            </div>
          </div>

          {/* Order Details */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Order Details
            </h3>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Wireless Headphones"
                value={form.productName}
                onChange={set('productName')}
              />
              {errors.productName && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.productName}</span>}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.quantity}
                  onChange={set('quantity')}
                />
                {errors.quantity && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.quantity}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price ($) *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={set('price')}
                />
                {errors.price && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.price}</span>}
              </div>
            </div>
          </div>

          {/* Total Preview */}
          {total > 0 && (
            <div style={{
              marginTop: '8px', marginBottom: '24px',
              padding: '16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-light)', border: '1px solid rgba(59,130,246,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Order Total</span>
                <span style={{ color: 'var(--accent)', fontSize: '22px', fontWeight: 700 }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={15} />
              {loading ? 'Saving...' : isEdit ? 'Update Order' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
