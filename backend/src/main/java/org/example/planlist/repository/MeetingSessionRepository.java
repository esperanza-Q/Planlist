package org.example.planlist.repository;

import org.example.planlist.entity.MeetingSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingSessionRepository extends JpaRepository<MeetingSession, Long> {
}
