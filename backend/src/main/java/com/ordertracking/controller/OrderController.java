package com.ordertracking.controller;

import com.ordertracking.dto.DashboardStats;
import com.ordertracking.dto.OrderRequest;
import com.ordertracking.dto.OrderResponse;
import com.ordertracking.model.OrderStatus;
import com.ordertracking.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders - Place a new order
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        log.info("Creating order for customer: {}", request.getCustomerEmail());
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/orders - Get all orders
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // GET /api/orders/{id} - Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // GET /api/orders/track/{trackingNumber} - Track order
    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<OrderResponse> trackOrder(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(orderService.getOrderByTrackingNumber(trackingNumber));
    }

    // GET /api/orders/customer/{email} - Get orders by customer email
    @GetMapping("/customer/{email}")
    public ResponseEntity<List<OrderResponse>> getOrdersByEmail(@PathVariable String email) {
        return ResponseEntity.ok(orderService.getOrdersByEmail(email));
    }

    // GET /api/orders/status/{status} - Get orders by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    // PUT /api/orders/{id} - Update order
    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.updateOrder(id, request));
    }

    // PATCH /api/orders/{id}/status - Update order status (triggers WebSocket)
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        OrderStatus newStatus = OrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(orderService.updateOrderStatus(id, newStatus));
    }

    // DELETE /api/orders/{id} - Delete order
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(Map.of("message", "Order deleted successfully"));
    }

    // GET /api/orders/dashboard/stats - Dashboard statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(orderService.getDashboardStats());
    }
}
