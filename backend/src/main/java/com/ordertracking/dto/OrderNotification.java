package com.ordertracking.dto;

import com.ordertracking.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderNotification {
    private Long orderId;
    private String trackingNumber;
    private String customerName;
    private String customerEmail;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    private String message;
    private LocalDateTime timestamp;
    private String type; // ORDER_CREATED, STATUS_UPDATED, ORDER_CANCELLED
}
