package org.example.planlist.repository;

import org.example.planlist.entity.DatePlanner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DatePlannerRepository extends JpaRepository<DatePlanner, Long> {
    boolean existsByProject_ProjectIdAndCategoryAndWishlist_WishlistId(
            Long projectId, DatePlanner.Category category, Long wishlistId
    );

    List<DatePlanner> findByProject_ProjectIdAndDateAndCategory(
            Long projectId,
            LocalDate date,
            DatePlanner.Category category
    );

    List<DatePlanner> findByProject_ProjectIdAndDate(Long projectId, LocalDate date);

}
