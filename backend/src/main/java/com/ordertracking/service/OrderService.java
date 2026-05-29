package com.ordertracking.service;

import com.ordertracking.dto.*;
import com.ordertracking.model.Order;
import com.ordertracking.model.OrderStatus;
import com.ordertracking.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Create Order ──────────────────────────────────────────────────────────
    public OrderResponse createOrder(OrderRequest request) {
        Order order = Order.builder()
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .productName(request.getProductName())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .shippingAddress(request.getShippingAddress())
                .status(OrderStatus.PENDING)
                .build();

        Order saved = orderRepository.save(order);
        log.info("Order created: {}", saved.getTrackingNumber());

        // Send WebSocket notification
        sendNotification(OrderNotification.builder()
                .orderId(saved.getId())
                .trackingNumber(saved.getTrackingNumber())
                .customerName(saved.getCustomerName())
                .customerEmail(saved.getCustomerEmail())
                .newStatus(saved.getStatus())
                .message("New order placed: " + saved.getTrackingNumber())
                .timestamp(LocalDateTime.now())
                .type("ORDER_CREATED")
                .build());

        return toResponse(saved);
    }

    // ── Get All Orders ────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Get Order By ID ───────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return toResponse(order);
    }

    // ── Get Order By Tracking Number ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public OrderResponse getOrderByTrackingNumber(String trackingNumber) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Order not found with tracking: " + trackingNumber));
        return toResponse(order);
    }

    // ── Get Orders By Email ───────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByEmail(String email) {
        return orderRepository.findByCustomerEmail(email)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Get Orders By Status ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Update Order Status ───────────────────────────────────────────────────
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Order {} status updated: {} -> {}", updated.getTrackingNumber(), previousStatus, newStatus);

        // Send WebSocket notification for status change
        sendNotification(OrderNotification.builder()
                .orderId(updated.getId())
                .trackingNumber(updated.getTrackingNumber())
                .customerName(updated.getCustomerName())
                .customerEmail(updated.getCustomerEmail())
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .message("Order " + updated.getTrackingNumber() + " status updated to: " + newStatus.getDisplayName())
                .timestamp(LocalDateTime.now())
                .type("STATUS_UPDATED")
                .build());

        return toResponse(updated);
    }

    // ── Update Full Order ─────────────────────────────────────────────────────
    public OrderResponse updateOrder(Long id, OrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setProductName(request.getProductName());
        order.setQuantity(request.getQuantity());
        order.setPrice(request.getPrice());
        order.setShippingAddress(request.getShippingAddress());

        Order updated = orderRepository.save(order);
        return toResponse(updated);
    }

    // ── Delete Order ──────────────────────────────────────────────────────────
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        orderRepository.delete(order);
        log.info("Order deleted: {}", id);
    }

    // ── Dashboard Stats ───────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();

        Map<String, Long> byStatus = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            byStatus.put(status.name(), orderRepository.countByStatus(status));
        }

        double totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(o -> o.getPrice() * o.getQuantity())
                .sum();

        return DashboardStats.builder()
                .totalOrders((long) allOrders.size())
                .pendingOrders(byStatus.getOrDefault("PENDING", 0L))
                .processingOrders(byStatus.getOrDefault("PROCESSING", 0L))
                .shippedOrders(byStatus.getOrDefault("SHIPPED", 0L))
                .deliveredOrders(byStatus.getOrDefault("DELIVERED", 0L))
                .cancelledOrders(byStatus.getOrDefault("CANCELLED", 0L))
                .totalRevenue(totalRevenue)
                .ordersByStatus(byStatus)
                .build();
    }

    // ── WebSocket Notification ────────────────────────────────────────────────
    private void sendNotification(OrderNotification notification) {
        // Broadcast to all subscribers
        messagingTemplate.convertAndSend("/topic/orders", notification);
        // Send to specific user by email
        messagingTemplate.convertAndSend("/topic/orders/" + notification.getCustomerEmail(), notification);
        log.info("Notification sent: {}", notification.getMessage());
    }

    // ── Map Order -> OrderResponse ────────────────────────────────────────────
    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .productName(order.getProductName())
                .quantity(order.getQuantity())
                .price(order.getPrice())
                .totalAmount(order.getPrice() * order.getQuantity())
                .status(order.getStatus())
                .statusDisplayName(order.getStatus().getDisplayName())
                .shippingAddress(order.getShippingAddress())
                .trackingNumber(order.getTrackingNumber())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .estimatedDelivery(order.getEstimatedDelivery())
                .build();
    }
}
