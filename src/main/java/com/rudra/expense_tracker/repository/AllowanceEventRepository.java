package com.rudra.expense_tracker.repository;

import com.rudra.expense_tracker.entity.AllowanceCycle;
import com.rudra.expense_tracker.entity.AllowanceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllowanceEventRepository extends JpaRepository<AllowanceEvent, Long> {

    List<AllowanceEvent> findByCycleOrderByDateAsc(AllowanceCycle cycle);

    List<AllowanceEvent> findByCycleIdOrderByDateAsc(Long cycleId);
}

