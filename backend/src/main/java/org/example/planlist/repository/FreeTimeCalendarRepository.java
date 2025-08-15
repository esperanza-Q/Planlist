package org.example.planlist.repository;

import org.example.planlist.entity.FreeTimeCalendar;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
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

    // 유저와 가능한 날짜로 조회
    List<FreeTimeCalendar> findByUserAndAvailableDate(User user, LocalDate availableDate);

    // 단일 사용자 하루 종일 가능한 날짜 조회
    List<FreeTimeCalendar> findByUserIdAndAllDayTrueAndAvailableDateBetween(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    void deleteAllByUserAndAvailableDateBetween(User user, LocalDate start, LocalDate end);

    void deleteAllByUserAndAvailableDateIn(User user, List<LocalDate> dates);

    // ✅ 벌크 삭제 (JPQL) — 이건 아주 잘 작성됨
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        DELETE FROM FreeTimeCalendar f
         WHERE f.user.id IN :userIds
           AND f.availableDate IN :dates
           AND f.allDay = true
    """)
    int deleteAllDayByUserIdsAndDates(@Param("userIds") Collection<Long> userIds,
                                      @Param("dates") Collection<LocalDate> dates);

}