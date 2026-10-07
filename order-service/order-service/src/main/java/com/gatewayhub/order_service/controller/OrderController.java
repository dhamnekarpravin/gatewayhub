package com.gatewayhub.order_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gatewayhub.order_service.dto.OrderRequest;
import com.gatewayhub.order_service.model.Order;
import com.gatewayhub.order_service.repository.OrderRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository repository;

    public OrderController(OrderRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestHeader("X-User-Id") String userId,
                                        @Valid @RequestBody OrderRequest request) {
        Order order = new Order();
        order.setUserId(userId);
        order.setProductName(request.getProductName());
        order.setQuantity(request.getQuantity());
        order.setPrice(request.getPrice());
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(order));
    }

    // Each user sees only their own orders
    @GetMapping
    public List<Order> list(@RequestHeader("X-User-Id") String userId) {
        return repository.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@RequestHeader("X-User-Id") String userId,
                                     @PathVariable Long id) {
        return repository.findById(id)
                .filter(o -> o.getUserId().equals(userId))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> update(@RequestHeader("X-User-Id") String userId,
                                        @PathVariable Long id,
                                        @Valid @RequestBody OrderRequest request) {
        return repository.findById(id)
                .filter(o -> o.getUserId().equals(userId))
                .map(order -> {
                    order.setProductName(request.getProductName());
                    order.setQuantity(request.getQuantity());
                    order.setPrice(request.getPrice());
                    return ResponseEntity.ok(repository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@RequestHeader("X-User-Id") String userId,
                                       @PathVariable Long id) {
        return repository.findById(id)
                .filter(o -> o.getUserId().equals(userId))
                .map(order -> {
                    repository.delete(order);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}



