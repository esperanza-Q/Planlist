package org.example.planlist.repository;

import org.example.planlist.entity.PlannerSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PlannerSessionRepository extends JpaRepository<PlannerSession, Long> {
    List<PlannerSession> findByDate(LocalDate date);// 자식까지 조회 가능


}