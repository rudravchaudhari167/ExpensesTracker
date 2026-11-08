package com.rudra.expense_tracker.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "allowance_cycles")
public class AllowanceCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "allowance_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal allowanceAmount;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "opening_balance", precision = 12, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name = "emergency_reserve", precision = 12, scale = 2)
    private BigDecimal emergencyReserve = BigDecimal.ZERO;

    @Column(name = "fixed_expenses", precision = 12, scale = 2)
    private BigDecimal fixedExpenses = BigDecimal.ZERO;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "cycle", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("date ASC, id ASC")
    private List<AllowanceEvent> events = new ArrayList<>();

    public AllowanceCycle() {
    }

    public AllowanceCycle(String name, BigDecimal allowanceAmount, LocalDate startDate, LocalDate endDate) {
        this.name = name;
        this.allowanceAmount = allowanceAmount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.openingBalance = BigDecimal.ZERO;
        this.emergencyReserve = BigDecimal.ZERO;
        this.fixedExpenses = BigDecimal.ZERO;
        this.active = true;
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.openingBalance == null) {
            this.openingBalance = BigDecimal.ZERO;
        }
        if (this.emergencyReserve == null) {
            this.emergencyReserve = BigDecimal.ZERO;
        }
        if (this.fixedExpenses == null) {
            this.fixedExpenses = BigDecimal.ZERO;
        }
    }

    public void addEvent(AllowanceEvent event) {
        events.add(event);
        event.setCycle(this);
    }

    public void removeEvent(AllowanceEvent event) {
        events.remove(event);
        event.setCycle(null);
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getAllowanceAmount() {
        return allowanceAmount;
    }

    public void setAllowanceAmount(BigDecimal allowanceAmount) {
        this.allowanceAmount = allowanceAmount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(BigDecimal openingBalance) {
        this.openingBalance = openingBalance;
    }

    public BigDecimal getEmergencyReserve() {
        return emergencyReserve;
    }

    public void setEmergencyReserve(BigDecimal emergencyReserve) {
        this.emergencyReserve = emergencyReserve;
    }

    public BigDecimal getFixedExpenses() {
        return fixedExpenses;
    }

    public void setFixedExpenses(BigDecimal fixedExpenses) {
        this.fixedExpenses = fixedExpenses;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<AllowanceEvent> getEvents() {
        return events;
    }

    public void setEvents(List<AllowanceEvent> events) {
        this.events = events;
    }
}

