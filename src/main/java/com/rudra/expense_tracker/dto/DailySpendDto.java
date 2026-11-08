package com.rudra.expense_tracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySpendDto(
        LocalDate date,
        String dayName,
        BigDecimal amount
) {
}

