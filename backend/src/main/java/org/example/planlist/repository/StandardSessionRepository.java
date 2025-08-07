package org.example.planlist.repository;

import org.example.planlist.entity.StandardSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StandardSessionRepository extends JpaRepository<StandardSession, Long> {
}
