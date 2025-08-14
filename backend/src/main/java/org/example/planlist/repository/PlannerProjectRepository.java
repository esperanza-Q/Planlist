package org.example.planlist.repository;

import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Repository
public interface PlannerProjectRepository extends JpaRepository<PlannerProject, Long> {

    PlannerProject findByProjectId(Long projectId);

    List<PlannerProject> findByCreatorAndStatus(User user, PlannerProject.Status status);

    int countByCreatorAndStatus(User creator, PlannerProject.Status status);

//    List<PlannerProject> findByCreatorAndStatus(User creator, PlannerProject.Status status);
//
//    @Query("SELECT p FROM PlannerProject p " +
//           "JOIN p.participants part " +
//           "JOIN part.user u " +
//           "WHERE u.id = :userId " +
//           "AND p.status = 'INPROGRESS' " +
//           "ORDER BY p.startDate ASC")
//    Optional<PlannerProject> findFirstInProgressProjectByUserIdOrderByStartDate(
//            @Param("userId") Long userId
//    );
}
