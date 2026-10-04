package com.gatewayhub.order_service.controller;

import com.gatewayhub.order_service.dto.OrderRequest;
import com.gatewayhub.order_service.model.Order;
import com.gatewayhub.order_service.repository.OrderRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository repository;

    public OrderController(OrderRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Order> create(@Valid @RequestBody OrderRequest request) {
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setProductName(request.getProductName());
        order.setQuantity(request.getQuantity());
        order.setPrice(request.getPrice());
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(order));
    }

    @GetMapping
    public List<Order> list(@RequestParam(required = false) String userId) {
        return userId == null ? repository.findAll() : repository.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> update(@PathVariable Long id,
                                        @Valid @RequestBody OrderRequest request) {
        return repository.findById(id).map(order -> {
            order.setProductName(request.getProductName());
            order.setQuantity(request.getQuantity());
            order.setPrice(request.getPrice());
            return ResponseEntity.ok(repository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}