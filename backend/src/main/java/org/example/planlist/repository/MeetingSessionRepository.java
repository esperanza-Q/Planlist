package org.example.planlist.repository;

import org.example.planlist.entity.MeetingSession;
import org.example.planlist.entity.PlannerProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingSessionRepository extends JpaRepository<MeetingSession, Long> {
    Optional<MeetingSession> findById(Long id);

    List<MeetingSession> findByProject_ProjectId(Long projectId);
    List<MeetingSession> findByProject(PlannerProject project);
}

