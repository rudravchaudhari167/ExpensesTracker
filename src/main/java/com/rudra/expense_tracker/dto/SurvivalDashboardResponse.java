package com.rudra.expense_tracker.dto;

import java.math.BigDecimal;
import java.util.List;

public record SurvivalDashboardResponse(
        AllowanceResponse cycle,
        BigDecimal totalAllowance,
        BigDecimal totalTopUps,
        BigDecimal totalSpent,
        BigDecimal remainingFlexibleMoney,
        BigDecimal dailySafeSpendingLimit,
        BigDecimal todaySpent,
        BigDecimal todayRemainingLimit,
        long daysRemaining,
        long totalDays,
        long daysElapsed,
        double budgetUsedPercentage,
        String statusColor,
        String statusMessage,
        BigDecimal projectedEndBalance,
        List<CategoryBreakdownDto> categoryBreakdown,
        WeeklyReportDto weeklyReport
) {
}

