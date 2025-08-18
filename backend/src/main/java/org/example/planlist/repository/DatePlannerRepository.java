package org.example.planlist.repository;

import org.example.planlist.entity.DatePlanner;
import org.example.planlist.entity.MoveBetweenPlaces;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DatePlannerRepository extends JpaRepository<DatePlanner, Long> {
    boolean existsByProject_ProjectIdAndCategoryAndWishlist_WishlistId(
            Long projectId, DatePlanner.Category category, Long wishlistId
    );

//    List<DatePlanner> findByProject_ProjectIdAndDateAndCategory(
//            Long projectId,
//            LocalDate date,
//            DatePlanner.Category category
//    );

    List<DatePlanner> findByProject_ProjectIdAndDate(Long projectId, LocalDate date);
    List<DatePlanner> findByProject_ProjectId(Long projectId);

//    // 🔹 로그인 유저 포함 + 상태 필터 + 날짜 조건 + category = TRAVEL
//    @Query("SELECT dp FROM DatePlanner dp " +
//            "JOIN dp.project.participants p " +
//            "WHERE p.user.id = :userId " +
//            "AND dp.date = :date " +
//            "AND dp.project.status IN :statuses " +
//            "AND dp.project.category = 'TRAVEL'")
//    List<DatePlanner> findTravelByUserAndDateAndStatuses(
//            @Param("userId") Long userId,
//            @Param("date") LocalDate date,
//            @Param("statuses") List<String> statuses
//    );

    @Query("""
        SELECT dp FROM DatePlanner dp
        JOIN dp.project p
        JOIN p.participants part
        WHERE part.user.id = :userId
          AND p.status IN :statuses
          AND dp.date BETWEEN :startDate AND :endDate
    """)
    List<DatePlanner> findTravelByUserAndDateRangeAndStatuses(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<String> statuses
    );

    boolean existsByProject_ProjectIdAndDateAndCategoryAndWishlist_WishlistId(
            Long projectId,
            LocalDate date,
            DatePlanner.Category category,
            Long wishlistId
    );

    @Query("""
       SELECT dp
       FROM DatePlanner dp
       WHERE dp.project.projectId = :projectId
       ORDER BY dp.date ASC, dp.visitTime ASC
    """)
    List<DatePlanner> findAllByProject_ProjectId(Long projectId);

}
