package org.example.planlist.repository;

import org.example.planlist.entity.PtSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PtSessionRepository extends JpaRepository<PtSession, Long> {
    Optional<PtSession> findById(Long id);

    List<PtSession> findByProject_ProjectId(Long projectId);





}
