package com.rudra.expense_tracker.dto;

import com.rudra.expense_tracker.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title must be at most 100 characters")
        String title,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        BigDecimal amount,

        @NotNull(message = "Type is required")
        TransactionType type,

        @Size(max = 50, message = "Category must be at most 50 characters")
        String category,

        @NotNull(message = "Date is required")
        LocalDate date

) {
}