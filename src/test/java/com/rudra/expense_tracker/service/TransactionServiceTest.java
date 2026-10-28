package com.rudra.expense_tracker.service;

import com.rudra.expense_tracker.dto.TransactionRequest;
import com.rudra.expense_tracker.entity.Transaction;
import com.rudra.expense_tracker.entity.TransactionType;
import com.rudra.expense_tracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository repository;

    @InjectMocks
    private TransactionService service;

    private Transaction sampleIncome;
    private Transaction sampleExpense;
    private TransactionRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleIncome = new Transaction(
                "Stipend",
                new BigDecimal("2500.00"),
                TransactionType.INCOME,
                "Salary",
                LocalDate.of(2026, 10, 24)
        );

        sampleExpense = new Transaction(
                "Coffee",
                new BigDecimal("35.50"),
                TransactionType.EXPENSE,
                "Coffee",
                LocalDate.of(2026, 10, 27)
        );

        sampleRequest = new TransactionRequest(
                "Stipend",
                new BigDecimal("2500.00"),
                TransactionType.INCOME,
                "Salary",
                LocalDate.of(2026, 10, 24)
        );
    }

    @Test
    @DisplayName("create() should save and return transaction")
    void testCreate_Success() {
        when(repository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            return t;
        });

        Transaction created = service.create(sampleRequest);

        assertNotNull(created);
        assertEquals("Stipend", created.getTitle());
        assertEquals(new BigDecimal("2500.00"), created.getAmount());
        assertEquals(TransactionType.INCOME, created.getType());
        assertEquals("Salary", created.getCategory());
        verify(repository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("create() with null request should throw ResponseStatusException")
    void testCreate_NullRequest() {
        assertThrows(ResponseStatusException.class, () -> service.create(null));
    }

    @Test
    @DisplayName("getById() with valid ID returns transaction")
    void testGetById_Found() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncome));

        Transaction found = service.getById(1L);

        assertNotNull(found);
        assertEquals("Stipend", found.getTitle());
    }

    @Test
    @DisplayName("getById() with unknown ID throws 404 NOT_FOUND")
    void testGetById_NotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> service.getById(999L));
    }

    @Test
    @DisplayName("getAll() should return all transactions")
    void testGetAll() {
        when(repository.findAll()).thenReturn(List.of(sampleIncome, sampleExpense));

        List<Transaction> result = service.getAll();

        assertEquals(2, result.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("getById() with null or negative ID throws 400 BAD_REQUEST")
    void testGetById_InvalidId() {
        assertThrows(ResponseStatusException.class, () -> service.getById(null));
        assertThrows(ResponseStatusException.class, () -> service.getById(0L));
        assertThrows(ResponseStatusException.class, () -> service.getById(-5L));
    }

    @Test
    @DisplayName("update() should update entity and save")
    void testUpdate_Success() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncome));
        when(repository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        TransactionRequest updateReq = new TransactionRequest(
                "Updated Stipend",
                new BigDecimal("3000.00"),
                TransactionType.INCOME,
                "Salary",
                LocalDate.of(2026, 10, 25)
        );

        Transaction updated = service.update(1L, updateReq);

        assertNotNull(updated);
        assertEquals("Updated Stipend", updated.getTitle());
        assertEquals(new BigDecimal("3000.00"), updated.getAmount());
    }

    @Test
    @DisplayName("update() with null request or invalid ID throws 400 BAD_REQUEST")
    void testUpdate_InvalidInputs() {
        assertThrows(ResponseStatusException.class, () -> service.update(null, sampleRequest));
        assertThrows(ResponseStatusException.class, () -> service.update(0L, sampleRequest));
        assertThrows(ResponseStatusException.class, () -> service.update(1L, null));
    }

    @Test
    @DisplayName("delete() should remove transaction")
    void testDelete_Success() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncome));
        doNothing().when(repository).delete(sampleIncome);

        service.delete(1L);

        verify(repository, times(1)).delete(sampleIncome);
    }

    @Test
    @DisplayName("delete() with null or invalid ID throws 400 BAD_REQUEST")
    void testDelete_InvalidId() {
        assertThrows(ResponseStatusException.class, () -> service.delete(null));
        assertThrows(ResponseStatusException.class, () -> service.delete(-1L));
    }

    @Test
    @DisplayName("getByType() should return filtered list or empty on null")
    void testGetByType() {
        when(repository.findByType(TransactionType.INCOME)).thenReturn(List.of(sampleIncome));

        List<Transaction> result = service.getByType(TransactionType.INCOME);
        assertEquals(1, result.size());
        assertEquals("Stipend", result.get(0).getTitle());

        List<Transaction> emptyResult = service.getByType(null);
        assertTrue(emptyResult.isEmpty());
    }

    @Test
    @DisplayName("getByCategory() should return filtered list and handle null/empty")
    void testGetByCategory() {
        when(repository.findByCategoryIgnoreCase("Salary")).thenReturn(List.of(sampleIncome));

        List<Transaction> result = service.getByCategory("Salary");
        assertEquals(1, result.size());

        assertTrue(service.getByCategory(null).isEmpty());
        assertTrue(service.getByCategory("   ").isEmpty());
    }

    @Test
    @DisplayName("getTotalIncome, getTotalExpenses, and getBalance calculate correctly")
    void testCalculations() {
        when(repository.findAll()).thenReturn(List.of(sampleIncome, sampleExpense));

        BigDecimal income = service.getTotalIncome();
        BigDecimal expenses = service.getTotalExpenses();
        BigDecimal balance = service.getBalance();

        assertEquals(new BigDecimal("2500.00"), income);
        assertEquals(new BigDecimal("35.50"), expenses);
        assertEquals(new BigDecimal("2464.50"), balance);
    }

    @Test
    @DisplayName("getSummary() correctly calculates income, expenses, and balance in single pass")
    void testGetSummary() {
        when(repository.findAll()).thenReturn(List.of(sampleIncome, sampleExpense));

        Map<String, BigDecimal> summary = service.getSummary();

        assertNotNull(summary);
        assertEquals(new BigDecimal("2500.00"), summary.get("totalIncome"));
        assertEquals(new BigDecimal("35.50"), summary.get("totalExpenses"));
        assertEquals(new BigDecimal("2464.50"), summary.get("balance"));
    }

    @Test
    @DisplayName("getSummary() handles empty dataset without throwing")
    void testGetSummary_Empty() {
        when(repository.findAll()).thenReturn(List.of());

        Map<String, BigDecimal> summary = service.getSummary();

        assertNotNull(summary);
        assertEquals(BigDecimal.ZERO, summary.get("totalIncome"));
        assertEquals(BigDecimal.ZERO, summary.get("totalExpenses"));
        assertEquals(BigDecimal.ZERO, summary.get("balance"));
    }
}
