package org.example.planlist.repository;

import org.example.planlist.entity.PtSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PtSessionRepository extends JpaRepository<PtSession, Long> {
    Optional<PtSession> findById(Long id);

}
