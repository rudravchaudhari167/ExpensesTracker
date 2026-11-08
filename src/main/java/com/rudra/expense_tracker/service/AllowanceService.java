package com.rudra.expense_tracker.service;

import com.rudra.expense_tracker.dto.AllowanceEventRequest;
import com.rudra.expense_tracker.dto.AllowanceEventResponse;
import com.rudra.expense_tracker.dto.AllowanceRequest;
import com.rudra.expense_tracker.dto.AllowanceResponse;
import com.rudra.expense_tracker.dto.SurvivalDashboardResponse;
import com.rudra.expense_tracker.dto.WeeklyReportDto;
import com.rudra.expense_tracker.entity.AllowanceCycle;
import com.rudra.expense_tracker.entity.AllowanceEvent;
import com.rudra.expense_tracker.entity.Transaction;
import com.rudra.expense_tracker.entity.TransactionType;
import com.rudra.expense_tracker.repository.AllowanceCycleRepository;
import com.rudra.expense_tracker.repository.AllowanceEventRepository;
import com.rudra.expense_tracker.repository.TransactionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class AllowanceService {

    private final AllowanceCycleRepository cycleRepository;
    private final AllowanceEventRepository eventRepository;
    private final TransactionRepository transactionRepository;
    private final SurvivalCalculatorService calculatorService;

    public AllowanceService(
            AllowanceCycleRepository cycleRepository,
            AllowanceEventRepository eventRepository,
            TransactionRepository transactionRepository,
            SurvivalCalculatorService calculatorService) {
        this.cycleRepository = cycleRepository;
        this.eventRepository = eventRepository;
        this.transactionRepository = transactionRepository;
        this.calculatorService = calculatorService;
    }

    // Create a new allowance cycle
    public AllowanceResponse createCycle(AllowanceRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Allowance request cannot be null");
        }
        if (request.startDate().isAfter(request.endDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot be after end date");
        }

        // Deactivate previous active cycles to set this one as the single active cycle
        List<AllowanceCycle> previousActive = cycleRepository.findByActiveTrue();
        for (AllowanceCycle c : previousActive) {
            c.setActive(false);
            cycleRepository.save(c);
        }

        AllowanceCycle cycle = new AllowanceCycle();
        String name = (request.name() != null && !request.name().isBlank())
                ? request.name().trim()
                : request.startDate().getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + request.startDate().getYear() + " Survival Plan";

        cycle.setName(name);
        cycle.setAllowanceAmount(request.allowanceAmount());
        cycle.setStartDate(request.startDate());
        cycle.setEndDate(request.endDate());
        cycle.setOpeningBalance(request.openingBalance() != null ? request.openingBalance() : BigDecimal.ZERO);
        cycle.setEmergencyReserve(request.emergencyReserve() != null ? request.emergencyReserve() : BigDecimal.ZERO);
        cycle.setFixedExpenses(request.fixedExpenses() != null ? request.fixedExpenses() : BigDecimal.ZERO);
        cycle.setNotes(request.notes() != null ? request.notes().trim() : null);
        cycle.setActive(true);

        AllowanceCycle saved = cycleRepository.save(cycle);
        return calculatorService.mapCycleToResponse(saved, List.of());
    }

    // Get currently active cycle
    @Transactional(readOnly = true)
    public AllowanceResponse getActiveCycle() {
        AllowanceCycle cycle = cycleRepository.findFirstByActiveTrueOrderByStartDateDesc()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active Student Survival allowance plan configured"));
        List<AllowanceEvent> events = eventRepository.findByCycleOrderByDateAsc(cycle);
        return calculatorService.mapCycleToResponse(cycle, events);
    }

    // Get full survival metrics dashboard for active cycle
    @Transactional(readOnly = true)
    public SurvivalDashboardResponse getActiveSurvivalDashboard() {
        AllowanceCycle cycle = cycleRepository.findFirstByActiveTrueOrderByStartDateDesc()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active Student Survival allowance plan configured"));

        return getSurvivalDashboardForCycle(cycle);
    }

    // Get survival metrics dashboard for any cycle by ID
    @Transactional(readOnly = true)
    public SurvivalDashboardResponse getSurvivalDashboardById(Long id) {
        AllowanceCycle cycle = getCycleEntity(id);
        return getSurvivalDashboardForCycle(cycle);
    }

    private SurvivalDashboardResponse getSurvivalDashboardForCycle(AllowanceCycle cycle) {
        // Query only transactions that are EXPENSE and strictly within the cycle date range
        List<Transaction> eligibleExpenses = transactionRepository.findByTypeAndDateBetweenOrderByDateAsc(
                TransactionType.EXPENSE,
                cycle.getStartDate(),
                cycle.getEndDate()
        );

        List<AllowanceEvent> topUpEvents = eventRepository.findByCycleOrderByDateAsc(cycle);

        return calculatorService.calculateSurvivalMetrics(cycle, eligibleExpenses, topUpEvents);
    }

    // List allowance cycle history
    @Transactional(readOnly = true)
    public List<AllowanceResponse> getHistory() {
        return cycleRepository.findAllByOrderByStartDateDesc().stream()
                .map(c -> {
                    List<AllowanceEvent> events = eventRepository.findByCycleOrderByDateAsc(c);
                    return calculatorService.mapCycleToResponse(c, events);
                })
                .toList();
    }

    // Get specific cycle by ID
    @Transactional(readOnly = true)
    public AllowanceResponse getById(Long id) {
        AllowanceCycle cycle = getCycleEntity(id);
        List<AllowanceEvent> events = eventRepository.findByCycleOrderByDateAsc(cycle);
        return calculatorService.mapCycleToResponse(cycle, events);
    }

    // Update an existing cycle
    public AllowanceResponse updateCycle(Long id, AllowanceRequest request) {
        AllowanceCycle cycle = getCycleEntity(id);

        if (request.startDate().isAfter(request.endDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot be after end date");
        }

        if (request.name() != null && !request.name().isBlank()) {
            cycle.setName(request.name().trim());
        }
        cycle.setAllowanceAmount(request.allowanceAmount());
        cycle.setStartDate(request.startDate());
        cycle.setEndDate(request.endDate());
        if (request.openingBalance() != null) {
            cycle.setOpeningBalance(request.openingBalance());
        }
        if (request.emergencyReserve() != null) {
            cycle.setEmergencyReserve(request.emergencyReserve());
        }
        if (request.fixedExpenses() != null) {
            cycle.setFixedExpenses(request.fixedExpenses());
        }
        if (request.notes() != null) {
            cycle.setNotes(request.notes().trim());
        }

        AllowanceCycle saved = cycleRepository.save(cycle);
        List<AllowanceEvent> events = eventRepository.findByCycleOrderByDateAsc(saved);
        return calculatorService.mapCycleToResponse(saved, events);
    }

    // Add a top-up event (pocket money, freelance, extra allowance)
    public AllowanceEventResponse addTopUp(Long cycleId, AllowanceEventRequest request) {
        AllowanceCycle cycle = getCycleEntity(cycleId);
        return saveTopUpEvent(cycle, request);
    }

    // Add a top-up event to the currently active cycle
    public AllowanceEventResponse addTopUpToActiveCycle(AllowanceEventRequest request) {
        AllowanceCycle activeCycle = cycleRepository.findFirstByActiveTrueOrderByStartDateDesc()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active Student Survival allowance plan configured"));
        return saveTopUpEvent(activeCycle, request);
    }

    private AllowanceEventResponse saveTopUpEvent(AllowanceCycle cycle, AllowanceEventRequest request) {
        AllowanceEvent event = new AllowanceEvent();
        event.setCycle(cycle);
        event.setAmount(request.amount());
        event.setDate(request.date());
        event.setDescription(request.description() != null ? request.description().trim() : "Allowance Top-up");

        AllowanceEvent saved = eventRepository.save(event);
        return new AllowanceEventResponse(
                saved.getId(),
                saved.getAmount(),
                saved.getDate(),
                saved.getDescription(),
                saved.getCreatedAt()
        );
    }

    // Get weekly report for cycle
    @Transactional(readOnly = true)
    public WeeklyReportDto getWeeklyReport(Long id) {
        SurvivalDashboardResponse metrics = getSurvivalDashboardById(id);
        return metrics.weeklyReport();
    }

    private AllowanceCycle getCycleEntity(Long id) {
        if (id == null || id <= 0) {
            return cycleRepository.findFirstByActiveTrueOrderByStartDateDesc()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active Student Survival allowance plan configured"));
        }
        return cycleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Allowance cycle not found with ID: " + id));
    }
}

