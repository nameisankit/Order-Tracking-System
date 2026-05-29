package com.ordertracking.repository;

import com.ordertracking.model.Order;
import com.ordertracking.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerEmail(String email);

    List<Order> findByStatus(OrderStatus status);

    Optional<Order> findByTrackingNumber(String trackingNumber);

    List<Order> findByCustomerNameContainingIgnoreCase(String customerName);

    @Query("SELECT o FROM Order o WHERE o.status NOT IN (com.ordertracking.model.OrderStatus.CANCELLED, com.ordertracking.model.OrderStatus.DELIVERED) ORDER BY o.createdAt DESC")
    List<Order> findActiveOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findAllOrderByCreatedAtDesc();
}
