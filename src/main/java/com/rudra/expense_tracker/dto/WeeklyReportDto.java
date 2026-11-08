package com.rudra.expense_tracker.dto;

import java.math.BigDecimal;
import java.util.List;

public record WeeklyReportDto(
        BigDecimal totalSpentThisWeek,
        BigDecimal averageDailySpending,
        String highestSpendingDay,
        BigDecimal highestSpendingDayAmount,
        String mostExpensiveCategory,
        BigDecimal mostExpensiveCategoryAmount,
        BigDecimal remainingAllowance,
        BigDecimal previousWeekTotal,
        Double percentChangeFromLastWeek,
        String insightMessage,
        List<DailySpendDto> dailySpending
) {
}

