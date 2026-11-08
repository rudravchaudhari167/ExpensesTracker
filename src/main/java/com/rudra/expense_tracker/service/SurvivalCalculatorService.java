package com.rudra.expense_tracker.service;

import com.rudra.expense_tracker.dto.AllowanceEventResponse;
import com.rudra.expense_tracker.dto.AllowanceResponse;
import com.rudra.expense_tracker.dto.CategoryBreakdownDto;
import com.rudra.expense_tracker.dto.DailySpendDto;
import com.rudra.expense_tracker.dto.SurvivalDashboardResponse;
import com.rudra.expense_tracker.dto.WeeklyReportDto;
import com.rudra.expense_tracker.entity.AllowanceCycle;
import com.rudra.expense_tracker.entity.AllowanceEvent;
import com.rudra.expense_tracker.entity.Transaction;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SurvivalCalculatorService {

    public SurvivalDashboardResponse calculateSurvivalMetrics(
            AllowanceCycle cycle,
            List<Transaction> cycleExpenses,
            List<AllowanceEvent> topUpEvents) {

        LocalDate today = LocalDate.now();

        // 1. Monetary Inputs with BigDecimal precision
        BigDecimal allowanceAmount = cycle.getAllowanceAmount() != null
                ? cycle.getAllowanceAmount()
                : BigDecimal.ZERO;
        BigDecimal openingBalance = cycle.getOpeningBalance() != null
                ? cycle.getOpeningBalance()
                : BigDecimal.ZERO;
        BigDecimal emergencyReserve = cycle.getEmergencyReserve() != null
                ? cycle.getEmergencyReserve()
                : BigDecimal.ZERO;
        BigDecimal fixedExpenses = cycle.getFixedExpenses() != null
                ? cycle.getFixedExpenses()
                : BigDecimal.ZERO;

        BigDecimal totalTopUps = BigDecimal.ZERO;
        if (topUpEvents != null) {
            for (AllowanceEvent event : topUpEvents) {
                if (event != null && event.getAmount() != null) {
                    totalTopUps = totalTopUps.add(event.getAmount());
                }
            }
        }
        totalTopUps = totalTopUps.setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAllowance = allowanceAmount
                .add(openingBalance)
                .add(totalTopUps)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalSpent = BigDecimal.ZERO;
        if (cycleExpenses != null) {
            for (Transaction tx : cycleExpenses) {
                if (tx != null && tx.getAmount() != null) {
                    totalSpent = totalSpent.add(tx.getAmount());
                }
            }
        }
        totalSpent = totalSpent.setScale(2, RoundingMode.HALF_UP);

        // Formula: Remaining Flexible Money = Allowance + Opening Balance + Top-ups - Fixed Expenses - Eligible Expenses - Emergency Reserve
        BigDecimal remainingFlexibleMoney = totalAllowance
                .subtract(fixedExpenses)
                .subtract(totalSpent)
                .subtract(emergencyReserve)
                .setScale(2, RoundingMode.HALF_UP);

        // 2. Timeline Calculations
        long totalDays = ChronoUnit.DAYS.between(cycle.getStartDate(), cycle.getEndDate()) + 1;
        if (totalDays <= 0) totalDays = 1;

        long daysElapsed;
        long daysRemaining;

        if (today.isBefore(cycle.getStartDate())) {
            daysElapsed = 0;
            daysRemaining = totalDays;
        } else if (today.isAfter(cycle.getEndDate())) {
            daysElapsed = totalDays;
            daysRemaining = 0;
        } else {
            daysElapsed = ChronoUnit.DAYS.between(cycle.getStartDate(), today) + 1;
            daysRemaining = ChronoUnit.DAYS.between(today, cycle.getEndDate()) + 1;
        }

        // 3. Daily Safe Spending Limit
        BigDecimal dailySafeSpendingLimit;
        if (daysRemaining > 0 && remainingFlexibleMoney.compareTo(BigDecimal.ZERO) > 0) {
            dailySafeSpendingLimit = remainingFlexibleMoney.divide(
                    BigDecimal.valueOf(daysRemaining),
                    2,
                    RoundingMode.HALF_UP
            );
        } else {
            dailySafeSpendingLimit = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        // 4. Today's Specific Spend and Limit
        BigDecimal todaySpent = BigDecimal.ZERO;
        if (cycleExpenses != null) {
            for (Transaction tx : cycleExpenses) {
                if (tx != null && tx.getDate() != null && tx.getDate().isEqual(today) && tx.getAmount() != null) {
                    todaySpent = todaySpent.add(tx.getAmount());
                }
            }
        }
        todaySpent = todaySpent.setScale(2, RoundingMode.HALF_UP);

        BigDecimal todayRemainingLimit = dailySafeSpendingLimit.subtract(todaySpent).setScale(2, RoundingMode.HALF_UP);

        // 5. Budget Usage & Status Indicator (GREEN, YELLOW, RED)
        BigDecimal totalFlexibleBudget = totalAllowance
                .subtract(fixedExpenses)
                .subtract(emergencyReserve);

        double budgetUsedPercentage = 0.0;
        if (totalFlexibleBudget.compareTo(BigDecimal.ZERO) > 0) {
            budgetUsedPercentage = totalSpent
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalFlexibleBudget, 1, RoundingMode.HALF_UP)
                    .doubleValue();
        } else if (totalSpent.compareTo(BigDecimal.ZERO) > 0) {
            budgetUsedPercentage = 100.0;
        }

        String statusColor;
        String statusMessage;

        if (remainingFlexibleMoney.compareTo(BigDecimal.ZERO) <= 0) {
            statusColor = "RED";
            statusMessage = "Critical Budget Alert! Your flexible allowance is exhausted. Lock all discretionary spending.";
        } else if (budgetUsedPercentage > 70.0 || (daysRemaining > 0 && todaySpent.compareTo(dailySafeSpendingLimit.multiply(BigDecimal.valueOf(1.5))) > 0)) {
            statusColor = "YELLOW";
            statusMessage = "Caution Advised! You have used " + budgetUsedPercentage + "% of your flexible budget. Keep daily spending below " + dailySafeSpendingLimit + " to make month-end safely.";
        } else {
            statusColor = "GREEN";
            statusMessage = "You're on track! Disciplined daily pace maintained. You are set to survive with surplus reserves.";
        }

        // 6. Projected Balance at Cycle End
        BigDecimal projectedEndBalance;
        if (daysRemaining > 0 && daysElapsed > 0 && totalSpent.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal avgDailySoFar = totalSpent.divide(BigDecimal.valueOf(daysElapsed), 2, RoundingMode.HALF_UP);
            BigDecimal projectedFutureExpenses = avgDailySoFar.multiply(BigDecimal.valueOf(daysRemaining));
            projectedEndBalance = remainingFlexibleMoney.subtract(projectedFutureExpenses).setScale(2, RoundingMode.HALF_UP);
        } else if (daysRemaining == 0) {
            projectedEndBalance = remainingFlexibleMoney;
        } else {
            projectedEndBalance = remainingFlexibleMoney;
        }

        // 7. Category Breakdown
        List<CategoryBreakdownDto> categoryBreakdown = buildCategoryBreakdown(cycleExpenses, totalSpent);

        // 8. Weekly Spending Report
        WeeklyReportDto weeklyReport = buildWeeklyReport(cycleExpenses, today, remainingFlexibleMoney);

        // 9. Map Cycle entity to response
        AllowanceResponse cycleDto = mapCycleToResponse(cycle, topUpEvents);

        return new SurvivalDashboardResponse(
                cycleDto,
                totalAllowance,
                totalTopUps,
                totalSpent,
                remainingFlexibleMoney,
                dailySafeSpendingLimit,
                todaySpent,
                todayRemainingLimit,
                daysRemaining,
                totalDays,
                daysElapsed,
                budgetUsedPercentage,
                statusColor,
                statusMessage,
                projectedEndBalance,
                categoryBreakdown,
                weeklyReport
        );
    }

    private List<CategoryBreakdownDto> buildCategoryBreakdown(List<Transaction> expenses, BigDecimal totalSpent) {
        Map<String, List<Transaction>> grouped = new LinkedHashMap<>();
        if (expenses != null) {
            for (Transaction tx : expenses) {
                if (tx != null && tx.getCategory() != null && !tx.getCategory().isBlank()) {
                    String cat = tx.getCategory().trim();
                    grouped.computeIfAbsent(cat, k -> new ArrayList<>()).add(tx);
                }
            }
        }

        List<CategoryBreakdownDto> breakdown = new ArrayList<>();
        for (Map.Entry<String, List<Transaction>> entry : grouped.entrySet()) {
            String category = entry.getKey();
            List<Transaction> txList = entry.getValue();

            BigDecimal catAmount = BigDecimal.ZERO;
            if (txList != null) {
                for (Transaction tx : txList) {
                    if (tx != null && tx.getAmount() != null) {
                        catAmount = catAmount.add(tx.getAmount());
                    }
                }
            }
            catAmount = catAmount.setScale(2, RoundingMode.HALF_UP);

            double pct = 0.0;
            if (totalSpent != null && totalSpent.compareTo(BigDecimal.ZERO) > 0) {
                pct = catAmount.multiply(BigDecimal.valueOf(100))
                        .divide(totalSpent, 1, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            breakdown.add(new CategoryBreakdownDto(category, catAmount, pct, txList != null ? txList.size() : 0));
        }

        breakdown.sort((a, b) -> {
            if (a == null || a.amount() == null) return 1;
            if (b == null || b.amount() == null) return -1;
            return b.amount().compareTo(a.amount());
        });
        return breakdown;
    }

    private WeeklyReportDto buildWeeklyReport(List<Transaction> expenses, LocalDate today, BigDecimal remainingAllowance) {
        // Last 7 days
        LocalDate weekStart = today.minusDays(6);
        LocalDate weekEnd = today;

        // Previous 7 days
        LocalDate prevWeekStart = weekStart.minusDays(7);
        LocalDate prevWeekEnd = weekStart.minusDays(1);

        List<DailySpendDto> dailySpending = new ArrayList<>();
        BigDecimal weekTotal = BigDecimal.ZERO;
        String highestDay = "None";
        BigDecimal highestDayAmount = BigDecimal.ZERO;

        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            DayOfWeek dow = d.getDayOfWeek();
            String dayName = dow.getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            BigDecimal dayAmount = BigDecimal.ZERO;
            if (expenses != null) {
                for (Transaction tx : expenses) {
                    if (tx != null && tx.getDate() != null && tx.getDate().isEqual(d) && tx.getAmount() != null) {
                        dayAmount = dayAmount.add(tx.getAmount());
                    }
                }
            }
            dayAmount = dayAmount.setScale(2, RoundingMode.HALF_UP);

            dailySpending.add(new DailySpendDto(d, dayName, dayAmount));
            weekTotal = weekTotal.add(dayAmount);

            if (dayAmount.compareTo(highestDayAmount) > 0) {
                highestDayAmount = dayAmount;
                highestDay = dayName + " (" + d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.getDayOfMonth() + ")";
            }
        }

        BigDecimal avgDaily = weekTotal.divide(BigDecimal.valueOf(7), 2, RoundingMode.HALF_UP);

        // Previous week total
        BigDecimal prevWeekTotal = BigDecimal.ZERO;
        if (expenses != null) {
            for (Transaction tx : expenses) {
                if (tx != null && tx.getDate() != null
                        && !tx.getDate().isBefore(prevWeekStart)
                        && !tx.getDate().isAfter(prevWeekEnd)
                        && tx.getAmount() != null) {
                    prevWeekTotal = prevWeekTotal.add(tx.getAmount());
                }
            }
        }
        prevWeekTotal = prevWeekTotal.setScale(2, RoundingMode.HALF_UP);

        Double percentChange = null;
        if (prevWeekTotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = weekTotal.subtract(prevWeekTotal);
            percentChange = diff.multiply(BigDecimal.valueOf(100))
                    .divide(prevWeekTotal, 1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // Most expensive category this week
        Map<String, BigDecimal> weekCats = new LinkedHashMap<>();
        if (expenses != null) {
            for (Transaction tx : expenses) {
                if (tx != null && tx.getDate() != null
                        && !tx.getDate().isBefore(weekStart)
                        && !tx.getDate().isAfter(weekEnd)
                        && tx.getCategory() != null
                        && !tx.getCategory().isBlank()
                        && tx.getAmount() != null) {
                    String cat = tx.getCategory().trim();
                    BigDecimal current = weekCats.getOrDefault(cat, BigDecimal.ZERO);
                    weekCats.put(cat, current.add(tx.getAmount()));
                }
            }
        }

        String topCat = "None";
        BigDecimal topCatAmount = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal> e : weekCats.entrySet()) {
            if (e.getValue().compareTo(topCatAmount) > 0) {
                topCatAmount = e.getValue();
                topCat = e.getKey();
            }
        }

        // Dynamic Insight Message based on genuine data
        String insightMessage;
        if (percentChange != null) {
            if (percentChange < 0) {
                insightMessage = "You spent " + Math.abs(percentChange) + "% less this week compared to last week. Great survival discipline!";
            } else if (percentChange > 0) {
                insightMessage = "Your spending increased by " + percentChange + "% this week. Watch your " + topCat + " outflows!";
            } else {
                insightMessage = "Your weekly spending matched last week exactly. Steady budget control.";
            }
        } else if (weekTotal.compareTo(BigDecimal.ZERO) == 0) {
            insightMessage = "Zero expenses recorded in the past 7 days. Your allowance is completely preserved!";
        } else {
            insightMessage = topCat + " was your highest spending category this week (" + topCatAmount + ").";
        }

        return new WeeklyReportDto(
                weekTotal,
                avgDaily,
                highestDay,
                highestDayAmount,
                topCat,
                topCatAmount,
                remainingAllowance,
                prevWeekTotal,
                percentChange,
                insightMessage,
                dailySpending
        );
    }

    public AllowanceResponse mapCycleToResponse(AllowanceCycle cycle, List<AllowanceEvent> events) {
        List<AllowanceEventResponse> eventDtos = new ArrayList<>();
        List<AllowanceEvent> sourceEvents = events != null ? events : (cycle != null ? cycle.getEvents() : null);
        if (sourceEvents != null) {
            for (AllowanceEvent e : sourceEvents) {
                if (e != null) {
                    eventDtos.add(new AllowanceEventResponse(
                            e.getId(),
                            e.getAmount(),
                            e.getDate(),
                            e.getDescription(),
                            e.getCreatedAt()
                    ));
                }
            }
        }

        return new AllowanceResponse(
                cycle.getId(),
                cycle.getName(),
                cycle.getAllowanceAmount(),
                cycle.getStartDate(),
                cycle.getEndDate(),
                cycle.getOpeningBalance(),
                cycle.getEmergencyReserve(),
                cycle.getFixedExpenses(),
                cycle.getNotes(),
                cycle.isActive(),
                cycle.getCreatedAt(),
                eventDtos
        );
    }
}

