package com.rudra.expense_tracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AllowanceEventRequest(
        @NotNull(message = "Top-up amount is required")
        @DecimalMin(value = "0.01", message = "Top-up amount must be positive")
        BigDecimal amount,

        @NotNull(message = "Date is required")
        LocalDate date,

        @Size(max = 200, message = "Description must be at most 200 characters")
        String description
) {
}

