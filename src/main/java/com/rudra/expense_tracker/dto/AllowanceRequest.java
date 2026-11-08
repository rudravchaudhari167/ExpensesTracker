package com.rudra.expense_tracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AllowanceRequest(
        @Size(max = 120, message = "Cycle name must be at most 120 characters")
        String name,

        @NotNull(message = "Allowance amount is required")
        @DecimalMin(value = "0.01", message = "Allowance amount must be positive")
        BigDecimal allowanceAmount,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @DecimalMin(value = "0.00", message = "Opening balance cannot be negative")
        BigDecimal openingBalance,

        @DecimalMin(value = "0.00", message = "Emergency reserve cannot be negative")
        BigDecimal emergencyReserve,

        @DecimalMin(value = "0.00", message = "Fixed expenses cannot be negative")
        BigDecimal fixedExpenses,

        @Size(max = 500, message = "Notes must be at most 500 characters")
        String notes
) {
}

