package com.ordertracking.dto;

import com.ordertracking.model.OrderStatus;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private Long id;
    private String customerName;
    private String customerEmail;
    private String productName;
    private Integer quantity;
    private Double price;
    private Double totalAmount;
    private OrderStatus status;
    private String statusDisplayName;
    private String shippingAddress;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime estimatedDelivery;
}
