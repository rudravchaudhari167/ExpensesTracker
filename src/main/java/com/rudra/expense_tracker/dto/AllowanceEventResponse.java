package com.rudra.expense_tracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AllowanceEventResponse(
        Long id,
        BigDecimal amount,
        LocalDate date,
        String description,
        LocalDateTime createdAt
) {
}

