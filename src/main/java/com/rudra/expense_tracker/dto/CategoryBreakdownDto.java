package com.rudra.expense_tracker.dto;

import java.math.BigDecimal;

public record CategoryBreakdownDto(
        String category,
        BigDecimal amount,
        double percentage,
        int count
) {
}

