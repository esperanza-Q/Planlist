package org.example.planlist.repository;

import org.example.planlist.entity.FreeTimeCalendar;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FreeTimeCalendarRepository extends JpaRepository<FreeTimeCalendar, Long> {
    Optional<FreeTimeCalendar> findByFreetimeId(Long freetimeId);
    List<FreeTimeCalendar> findAllByUser(User user);
    void deleteAllByUser(User user);
    List<FreeTimeCalendar> findAllByUserAndAvailableDateBetween(User user, LocalDate start, LocalDate end);

    List<FreeTimeCalendar> findByUserIdInAndAvailableDateBetween(List<Long> userIds, LocalDate startDate, LocalDate endDate);
    // 📌 추가: all_day = true + 날짜 범위
    List<FreeTimeCalendar> findByUserIdInAndAllDayTrueAndAvailableDateBetween(
            List<Long> userIds, LocalDate startDate, LocalDate endDate);
}