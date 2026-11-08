package com.rudra.expense_tracker.repository;

import com.rudra.expense_tracker.entity.AllowanceCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AllowanceCycleRepository extends JpaRepository<AllowanceCycle, Long> {

    Optional<AllowanceCycle> findFirstByActiveTrueOrderByStartDateDesc();

    List<AllowanceCycle> findAllByOrderByStartDateDesc();

    List<AllowanceCycle> findByActiveTrue();
}

