package org.example.planlist.repository;

import org.example.planlist.entity.FreeTimeCalendar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FreeTimeCalendarRepository extends JpaRepository<FreeTimeCalendar, Long> {
    Optional<FreeTimeCalendar> findByFreetimeId(Long freetimeId);
}
