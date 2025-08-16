package org.example.planlist.repository;

import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.PlannerSession;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.PtSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface PlannerSessionRepository extends JpaRepository<PlannerSession, Long> {
    List<PlannerSession> findByDate(LocalDate date);// 자식까지 조회 가능

    Optional<PlannerSession> findFirstByProjectParticipantsUserIdAndProjectParticipantsResponseAndDateAndStartTimeGreaterThanAndProjectStatusInAndIsFinalizedTrueOrderByStartTimeAsc(
            Long userId,
            ProjectParticipant.Response response,
            LocalDate today,
            LocalTime nowTime,
            List<String> statuses
    );

    Optional<PlannerSession> findById(Long plannerId);

    List<PlannerSession> findByProject(PlannerProject project);

    List<PtSession> findByProject_ProjectId(Long projectId);

    // 🔹 로그인 유저 포함 + 상태 필터 + 날짜 조건 + is_finalized = true
//    @Query("SELECT ps FROM PlannerSession ps " +
//            "JOIN ps.project.participants p " +
//            "WHERE p.user.id = :userId " +
//            "AND ps.date = :date " +
//            "AND ps.isFinalized = true " +
//            "AND ps.project.status IN :statuses " +
//            "AND ps.project.category <> 'TRAVEL'")
//    List<PlannerSession> findFinalizedByUserAndDateAndStatusesExcludeTravel(
//            @Param("userId") Long userId,
//            @Param("date") LocalDate date,
//            @Param("statuses") List<String> statuses
//    );

    @Query("""
        SELECT ps FROM PlannerSession ps
        JOIN ps.project p
        JOIN p.participants part
        WHERE part.user.id = :userId
          AND p.status IN :statuses
          AND ps.date BETWEEN :startDate AND :endDate
          AND ps.isFinalized = true
    """)
    List<PlannerSession> findFinalizedByUserAndDateRangeAndStatuses(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<String> statuses
    );
}

