package com.rudra.expense_tracker.repository;

import com.rudra.expense_tracker.entity.Transaction;
import com.rudra.expense_tracker.entity.TransactionType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByType(TransactionType type);

    List<Transaction> findByCategoryIgnoreCase(String category);

    List<Transaction> findByTypeAndDateBetweenOrderByDateAsc(TransactionType type, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByTypeAndDate(TransactionType type, LocalDate date);
}
