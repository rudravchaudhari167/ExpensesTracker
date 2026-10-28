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
import java.util.List;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    // Create a new transaction
    public Transaction create(TransactionRequest request) {
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
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found with ID: " + id
                ));
    }

    // Update an existing transaction
    public Transaction update(
            Long id, TransactionRequest request) {

        Transaction transaction = getById(id);

        copyRequestToEntity(request, transaction);

        return repository.save(transaction);
    }

    // Delete a transaction
    public void delete(Long id) {
        Transaction transaction = getById(id);
        repository.delete(transaction);
    }

    // Filter transactions by type
    @Transactional(readOnly = true)
    public List<Transaction> getByType(TransactionType type) {
        return repository.findByType(type);
    }

    // Filter transactions by category
    @Transactional(readOnly = true)
    public List<Transaction> getByCategory(String category) {
        return repository.findByCategoryIgnoreCase(category);
    }

    // Calculate total income
    @Transactional(readOnly = true)
    public BigDecimal getTotalIncome() {
        return getAll().stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Calculate total expenses
    @Transactional(readOnly = true)
    public BigDecimal getTotalExpenses() {
        return getAll().stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Calculate remaining balance
    @Transactional(readOnly = true)
    public BigDecimal getBalance() {
        return getTotalIncome().subtract(getTotalExpenses());
    }

    private void copyRequestToEntity(
            TransactionRequest request,
            Transaction transaction) {

        transaction.setTitle(request.title().trim());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategory(request.category().trim());
        transaction.setDate(request.date());
    }
}