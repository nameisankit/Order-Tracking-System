import api from './api';

export const getAllOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const trackOrder = (trackingNumber) => api.get(`/orders/track/${trackingNumber}`);
export const getOrdersByEmail = (email) => api.get(`/orders/customer/${email}`);
export const getOrdersByStatus = (status) => api.get(`/orders/status/${status}`);
export const createOrder = (orderData) => api.post('/orders', orderData);
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const getDashboardStats = () => api.get('/orders/dashboard/stats');

export default api;
