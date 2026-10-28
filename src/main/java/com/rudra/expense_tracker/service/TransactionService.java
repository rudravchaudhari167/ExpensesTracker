package com.rudra.expense_tracker.service;

import com.rudra.expense_tracker.dto.TransactionRequest;
import com.rudra.expense_tracker.entity.Transaction;
import com.rudra.expense_tracker.entity.TransactionType;
import com.rudra.expense_tracker.repository.TransactionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    // Create a new transaction
    public Transaction create(TransactionRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction request must not be null");
        }
        Transaction transaction = new Transaction();
        copyRequestToEntity(request, transaction);
        return repository.save(transaction);
    }

    // Get all transactions
    @Transactional(readOnly = true)
    public List<Transaction> getAll() {
        return repository.findAll();
    }

    // Get one transaction by ID
    @Transactional(readOnly = true)
    public Transaction getById(Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction ID must be a valid positive number");
        }
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found with ID: " + id
                ));
    }

    // Update an existing transaction
    public Transaction update(Long id, TransactionRequest request) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction ID must be a valid positive number");
        }
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction request must not be null");
        }

        Transaction transaction = getById(id);
        copyRequestToEntity(request, transaction);
        return repository.save(transaction);
    }

    // Delete a transaction
    public void delete(Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction ID must be a valid positive number");
        }
        Transaction transaction = getById(id);
        repository.delete(transaction);
    }

    // Filter transactions by type
    @Transactional(readOnly = true)
    public List<Transaction> getByType(TransactionType type) {
        if (type == null) {
            return List.of();
        }
        return repository.findByType(type);
    }

    // Filter transactions by category
    @Transactional(readOnly = true)
    public List<Transaction> getByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return List.of();
        }
        return repository.findByCategoryIgnoreCase(category.trim());
    }

    // Calculate total income safely
    @Transactional(readOnly = true)
    public BigDecimal getTotalIncome() {
        BigDecimal total = BigDecimal.ZERO;
        for (Transaction t : getAll()) {
            if (t != null && t.getType() == TransactionType.INCOME && t.getAmount() != null) {
                total = total.add(t.getAmount());
            }
        }
        return total;
    }

    // Calculate total expenses safely
    @Transactional(readOnly = true)
    public BigDecimal getTotalExpenses() {
        BigDecimal total = BigDecimal.ZERO;
        for (Transaction t : getAll()) {
            if (t != null && t.getType() == TransactionType.EXPENSE && t.getAmount() != null) {
                total = total.add(t.getAmount());
            }
        }
        return total;
    }

    // Calculate remaining balance safely
    @Transactional(readOnly = true)
    public BigDecimal getBalance() {
        return getTotalIncome().subtract(getTotalExpenses());
    }

    // Optimized single-pass financial summary calculation
    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getSummary() {
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Transaction t : getAll()) {
            if (t == null || t.getAmount() == null) continue;
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                totalExpenses = totalExpenses.add(t.getAmount());
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpenses);

        Map<String, BigDecimal> summary = new LinkedHashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("balance", balance);
        return summary;
    }

    private void copyRequestToEntity(
            TransactionRequest request,
            Transaction transaction) {
        if (request == null || transaction == null) {
            return;
        }
        transaction.setTitle(request.title() != null ? request.title().trim() : null);
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        String cat = (request.category() != null && !request.category().trim().isEmpty())
                ? request.category().trim()
                : (request.type() == TransactionType.INCOME ? "Income" : "General");
        transaction.setCategory(cat);
        transaction.setDate(request.date());
    }
}