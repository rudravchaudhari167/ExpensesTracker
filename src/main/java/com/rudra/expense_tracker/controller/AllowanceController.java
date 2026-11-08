package com.rudra.expense_tracker.controller;

import com.rudra.expense_tracker.dto.AllowanceEventRequest;
import com.rudra.expense_tracker.dto.AllowanceEventResponse;
import com.rudra.expense_tracker.dto.AllowanceRequest;
import com.rudra.expense_tracker.dto.AllowanceResponse;
import com.rudra.expense_tracker.dto.SurvivalDashboardResponse;
import com.rudra.expense_tracker.dto.WeeklyReportDto;
import com.rudra.expense_tracker.service.AllowanceService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/allowances")
public class AllowanceController {

    private final AllowanceService service;

    public AllowanceController(AllowanceService service) {
        this.service = service;
    }

    // Create a new allowance cycle
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AllowanceResponse createCycle(@Valid @RequestBody AllowanceRequest request) {
        return service.createCycle(request);
    }

    // Retrieve active allowance plan
    @GetMapping("/active")
    public AllowanceResponse getActiveCycle() {
        return service.getActiveCycle();
    }

    // Retrieve live survival metrics & dashboard for active cycle
    @GetMapping("/active/survival")
    public SurvivalDashboardResponse getActiveSurvivalDashboard() {
        return service.getActiveSurvivalDashboard();
    }

    // Retrieve history of allowance cycles
    @GetMapping("/history")
    public List<AllowanceResponse> getHistory() {
        return service.getHistory();
    }

    // Retrieve specific allowance cycle
    @GetMapping("/{id}")
    public AllowanceResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // Update an existing cycle
    @PutMapping("/{id}")
    public AllowanceResponse updateCycle(
            @PathVariable Long id,
            @Valid @RequestBody AllowanceRequest request) {
        return service.updateCycle(id, request);
    }

    // Add an allowance top-up (pocket money, freelance, extra cash)
    @PostMapping("/{id}/events")
    @ResponseStatus(HttpStatus.CREATED)
    public AllowanceEventResponse addTopUp(
            @PathVariable Long id,
            @Valid @RequestBody AllowanceEventRequest request) {
        return service.addTopUp(id, request);
    }

    // Retrieve survival metrics for any cycle (including historical reviews)
    @GetMapping("/{id}/survival")
    public SurvivalDashboardResponse getSurvivalById(@PathVariable Long id) {
        return service.getSurvivalDashboardById(id);
    }

    // Retrieve weekly survival report for a cycle
    @GetMapping("/{id}/weekly-report")
    public WeeklyReportDto getWeeklyReport(@PathVariable Long id) {
        return service.getWeeklyReport(id);
    }
}

