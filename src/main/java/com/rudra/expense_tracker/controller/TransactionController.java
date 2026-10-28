package com.rudra.expense_tracker.controller;

import com.rudra.expense_tracker.dto.TransactionRequest;
import com.rudra.expense_tracker.entity.Transaction;
import com.rudra.expense_tracker.entity.TransactionType;
import com.rudra.expense_tracker.service.TransactionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    // Create a transaction
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction create(
            @Valid @RequestBody TransactionRequest request) {
        return service.create(request);
    }

    // Retrieve all transactions
    @GetMapping
    public List<Transaction> getAll() {
        return service.getAll();
    }

    // Retrieve a transaction by ID
    @GetMapping("/{id}")
    public Transaction getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // Update a transaction
    @PutMapping("/{id}")
    public Transaction update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        return service.update(id, request);
    }

    // Delete a transaction
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // Filter by transaction type
    @GetMapping("/type/{type}")
    public List<Transaction> getByType(
            @PathVariable TransactionType type) {
        return service.getByType(type);
    }

    // Filter by category
    @GetMapping("/category/{category}")
    public List<Transaction> getByCategory(
            @PathVariable String category) {
        return service.getByCategory(category);
    }

    // Get financial summary
    @GetMapping("/summary")
    public Map<String, BigDecimal> getSummary() {
        return Map.of(
                "totalIncome", service.getTotalIncome(),
                "totalExpenses", service.getTotalExpenses(),
                "balance", service.getBalance()
        );
    }
}