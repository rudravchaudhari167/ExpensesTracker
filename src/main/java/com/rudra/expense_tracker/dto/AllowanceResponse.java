package com.rudra.expense_tracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AllowanceResponse(
        Long id,
        String name,
        BigDecimal allowanceAmount,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal openingBalance,
        BigDecimal emergencyReserve,
        BigDecimal fixedExpenses,
        String notes,
        boolean active,
        LocalDateTime createdAt,
        List<AllowanceEventResponse> events
) {
}

