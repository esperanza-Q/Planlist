package org.example.planlist.repository;

import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.StandardSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StandardSessionRepository extends JpaRepository<StandardSession, Long> {
    Optional<StandardSession> findById(Long id);

    List<StandardSession> findByProject_ProjectId(Long projectId);

    List<StandardSession> findByProject(PlannerProject project);
}
