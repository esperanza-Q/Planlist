package org.example.planlist.repository;

import org.example.planlist.entity.PlannerSession;
import org.example.planlist.entity.ProjectParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface PlannerSessionRepository extends JpaRepository<PlannerSession, Long> {
    List<PlannerSession> findByDate(LocalDate date);// 자식까지 조회 가능

//    @Query("SELECT s FROM PlannerSession s " +
//            "JOIN s.project p " +
//            "JOIN p.participants part " +
//            "JOIN part.user u " +
//            "WHERE u.id = :userId " +
//            "AND s.date = :today " +
//            "AND s.startTime > :nowTime " +
//            "AND p.status IN ('INPROGRESS', 'FINISHED') " +
//            "AND s.isFinalized = true " +
//            "ORDER BY s.startTime ASC")
//    Optional<PlannerSession> findNextSessionToday(
//            @Param("userId") Long userId,
//            @Param("today") LocalDate today,
//            @Param("nowTime") LocalTime nowTime
//    );

    Optional<PlannerSession> findFirstByProjectParticipantsUserIdAndProjectParticipantsResponseAndDateAndStartTimeGreaterThanAndProjectStatusInAndIsFinalizedTrueOrderByStartTimeAsc(
            Long userId,
            ProjectParticipant.Response response,
            LocalDate today,
            LocalTime nowTime,
            List<String> statuses);


}