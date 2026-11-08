package com.rudra.expense_tracker.service;

import com.rudra.expense_tracker.dto.AllowanceEventRequest;
import com.rudra.expense_tracker.dto.AllowanceEventResponse;
import com.rudra.expense_tracker.dto.AllowanceRequest;
import com.rudra.expense_tracker.dto.AllowanceResponse;
import com.rudra.expense_tracker.dto.SurvivalDashboardResponse;
import com.rudra.expense_tracker.entity.AllowanceCycle;
import com.rudra.expense_tracker.entity.AllowanceEvent;
import com.rudra.expense_tracker.entity.Transaction;
import com.rudra.expense_tracker.entity.TransactionType;
import com.rudra.expense_tracker.repository.AllowanceCycleRepository;
import com.rudra.expense_tracker.repository.AllowanceEventRepository;
import com.rudra.expense_tracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AllowanceServiceTest {

    @Mock
    private AllowanceCycleRepository cycleRepository;

    @Mock
    private AllowanceEventRepository eventRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Spy
    private SurvivalCalculatorService calculatorService = new SurvivalCalculatorService();

    @InjectMocks
    private AllowanceService service;

    private AllowanceCycle sampleCycle;

    @BeforeEach
    void setUp() {
        LocalDate start = LocalDate.now().minusDays(5);
        LocalDate end = LocalDate.now().plusDays(20);

        sampleCycle = new AllowanceCycle(
                "November Survival",
                new BigDecimal("8000.00"),
                start,
                end
        );
        sampleCycle.setId(1L);
        sampleCycle.setOpeningBalance(new BigDecimal("500.00"));
        sampleCycle.setEmergencyReserve(new BigDecimal("500.00"));
        sampleCycle.setFixedExpenses(new BigDecimal("1000.00"));
    }

    @Test
    @DisplayName("Create cycle sets active and deactivates older cycles")
    void testCreateCycle() {
        AllowanceRequest request = new AllowanceRequest(
                "November 2026",
                new BigDecimal("8000.00"),
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                new BigDecimal("200.00"),
                new BigDecimal("500.00"),
                new BigDecimal("1000.00"),
                "Keep food expenses minimal"
        );

        when(cycleRepository.findByActiveTrue()).thenReturn(List.of(sampleCycle));
        when(cycleRepository.save(any(AllowanceCycle.class))).thenAnswer(invocation -> {
            AllowanceCycle c = invocation.getArgument(0);
            c.setId(2L);
            return c;
        });

        AllowanceResponse response = service.createCycle(request);

        assertNotNull(response);
        assertEquals("November 2026", response.name());
        assertEquals(new BigDecimal("8000.00"), response.allowanceAmount());
        assertTrue(response.active());
        assertFalse(sampleCycle.isActive());
        verify(cycleRepository, atLeast(2)).save(any(AllowanceCycle.class));
    }

    @Test
    @DisplayName("Calculate Survival Metrics correctly with BigDecimal precision and top-ups")
    void testSurvivalCalculations() {
        when(cycleRepository.findFirstByActiveTrueOrderByStartDateDesc()).thenReturn(Optional.of(sampleCycle));

        // Expenses within cycle
        List<Transaction> expenses = List.of(
                new Transaction("Canteen Lunch", new BigDecimal("150.00"), TransactionType.EXPENSE, "Food and Canteen", LocalDate.now().minusDays(1)),
                new Transaction("Bus Pass", new BigDecimal("350.00"), TransactionType.EXPENSE, "Transportation", LocalDate.now().minusDays(2)),
                new Transaction("Snacks", new BigDecimal("100.00"), TransactionType.EXPENSE, "Food and Canteen", LocalDate.now())
        );

        // Top-up event
        AllowanceEvent topUp = new AllowanceEvent(sampleCycle, new BigDecimal("1000.00"), LocalDate.now(), "Pocket money from dad");
        topUp.setId(10L);

        when(transactionRepository.findByTypeAndDateBetweenOrderByDateAsc(
                eq(TransactionType.EXPENSE),
                eq(sampleCycle.getStartDate()),
                eq(sampleCycle.getEndDate())
        )).thenReturn(expenses);

        when(eventRepository.findByCycleOrderByDateAsc(sampleCycle)).thenReturn(List.of(topUp));

        SurvivalDashboardResponse metrics = service.getActiveSurvivalDashboard();

        assertNotNull(metrics);
        // Total Allowance = 8000 (base) + 500 (opening) + 1000 (top-up) = 9500
        assertEquals(new BigDecimal("9500.00"), metrics.totalAllowance());

        // Total Spent = 150 + 350 + 100 = 600
        assertEquals(new BigDecimal("600.00"), metrics.totalSpent());

        // Remaining Flexible = 9500 (total) - 1000 (fixed) - 600 (spent) - 500 (reserve) = 7400
        assertEquals(new BigDecimal("7400.00"), metrics.remainingFlexibleMoney());

        // Remaining days = today to today + 20 = 21 days
        assertEquals(21, metrics.daysRemaining());

        // Daily Safe Spending Limit = 7400 / 21 = 352.38
        assertEquals(new BigDecimal("352.38"), metrics.dailySafeSpendingLimit());

        // Today spent = 100
        assertEquals(new BigDecimal("100.00"), metrics.todaySpent());

        // Today remaining = 352.38 - 100.00 = 252.38
        assertEquals(new BigDecimal("252.38"), metrics.todayRemainingLimit());

        // Status color should be GREEN (budget used is ~7.5%)
        assertEquals("GREEN", metrics.statusColor());

        // Categories breakdown
        assertFalse(metrics.categoryBreakdown().isEmpty());
        assertEquals("Transportation", metrics.categoryBreakdown().get(0).category());
        assertEquals(new BigDecimal("350.00"), metrics.categoryBreakdown().get(0).amount());
        assertEquals("Food and Canteen", metrics.categoryBreakdown().get(1).category());
        assertEquals(new BigDecimal("250.00"), metrics.categoryBreakdown().get(1).amount());
    }

    @Test
    @DisplayName("Add top-up saves event and links to cycle")
    void testAddTopUp() {
        when(cycleRepository.findById(1L)).thenReturn(Optional.of(sampleCycle));
        when(eventRepository.save(any(AllowanceEvent.class))).thenAnswer(invocation -> {
            AllowanceEvent e = invocation.getArgument(0);
            e.setId(101L);
            return e;
        });

        AllowanceEventRequest request = new AllowanceEventRequest(
                new BigDecimal("500.00"),
                LocalDate.now(),
                "Freelance Gig"
        );

        AllowanceEventResponse response = service.addTopUp(1L, request);

        assertNotNull(response);
        assertEquals(101L, response.id());
        assertEquals(new BigDecimal("500.00"), response.amount());
        assertEquals("Freelance Gig", response.description());
        verify(eventRepository, times(1)).save(any(AllowanceEvent.class));
    }

    @Test
    @DisplayName("Add top-up directly to active cycle when no ID provided")
    void testAddTopUpToActiveCycle() {
        when(cycleRepository.findFirstByActiveTrueOrderByStartDateDesc()).thenReturn(Optional.of(sampleCycle));
        when(eventRepository.save(any(AllowanceEvent.class))).thenAnswer(invocation -> {
            AllowanceEvent e = invocation.getArgument(0);
            e.setId(102L);
            return e;
        });

        AllowanceEventRequest request = new AllowanceEventRequest(
                new BigDecimal("300.00"),
                LocalDate.now(),
                "Pocket money"
        );

        AllowanceEventResponse response = service.addTopUpToActiveCycle(request);

        assertNotNull(response);
        assertEquals(102L, response.id());
        assertEquals(new BigDecimal("300.00"), response.amount());
        assertEquals("Pocket money", response.description());
        verify(eventRepository, times(1)).save(any(AllowanceEvent.class));
    }

    @Test
    @DisplayName("Throws 400 when start date is after end date")
    void testInvalidDates() {
        AllowanceRequest request = new AllowanceRequest(
                "Invalid",
                new BigDecimal("5000.00"),
                LocalDate.of(2026, 11, 30),
                LocalDate.of(2026, 11, 1),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                null
        );

        assertThrows(ResponseStatusException.class, () -> service.createCycle(request));
    }
}
