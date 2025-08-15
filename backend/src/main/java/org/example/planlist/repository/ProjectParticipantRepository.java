// src/main/java/org/example/planlist/repository/ProjectParticipantRepository.java
package org.example.planlist.repository;

import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.dto.ProfileDTO.ProjectRequestDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectParticipantRepository extends JpaRepository<ProjectParticipant, Long> {

    List<ProjectParticipant> findByUser(User user);

    List<ProjectParticipant> findByProject_ProjectIdAndResponse(Long projectId, ProjectParticipant.Response response);

    List<ProjectParticipant> findByProject_ProjectId(Long projectId);

    // ProjectParticipant findByProjectAndUser(PlannerProject project, User User);

    ProjectParticipant findByProject_ProjectIdAndUserId(Long ProjectId, Long UserId);

    // Optional<ProjectParticipant> findByUserId(Long userId);

    @Query("SELECT p FROM ProjectParticipant p WHERE p.project.id = :projectId")
    List<ProjectParticipant> findAllEntitiesByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT new org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO(" +
            "p.project.id, p.user.id, p.response, p.responseAt, p.role) " +
            "FROM ProjectParticipant p WHERE p.project.id = :projectId")
    List<ProjectParticipantRequestDTO> findAllDtosByProjectId(@Param("projectId") Long projectId);

    boolean existsByProjectAndUser(PlannerProject project, User friend);

    Optional<ProjectParticipant> findByIdAndProject_ProjectId(Long participantId, Long projectId);

    List<ProjectParticipant> findByProject(PlannerProject project);

    @Query("""
        SELECT pp
        FROM ProjectParticipant pp
        JOIN FETCH pp.user u
        WHERE pp.project = :project
    """)
    List<ProjectParticipant> findWithUserByProject(@Param("project") PlannerProject project);

    Optional<ProjectParticipant> findByProjectAndUser(PlannerProject project, User user);

    // ✅ NEW: return ProfileDTO.ProjectRequestDTO directly (joins project + creator)
    @Query("SELECT new org.example.planlist.dto.ProfileDTO.ProjectRequestDTO(" +
       " pp.id, p.projectTitle, c.name) " +
       "FROM ProjectParticipant pp " +
       "JOIN pp.project p " +
       "JOIN p.creator c " +
       "WHERE pp.user = :user " +
       "AND (pp.response = :waiting OR pp.response IS NULL)")
    List<ProjectRequestDTO> findPendingInviteDtosForUser(
            @Param("user") User user,
            @Param("waiting") ProjectParticipant.Response waiting
    );
}
