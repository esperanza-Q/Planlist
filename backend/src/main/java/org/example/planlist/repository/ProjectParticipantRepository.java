package org.example.planlist.repository;

import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
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

    List<ProjectParticipant> findByUserAndResponse(User user, ProjectParticipant.Response response);

    List<ProjectParticipant> findByProject_ProjectIdAndResponse(Long projectId, ProjectParticipant.Response response);

    List<ProjectParticipant> findByProject_ProjectId(Long projectId);

//    ProjectParticipant findByProjectAndUser(PlannerProject project, User User);

    ProjectParticipant findByProject_ProjectIdAndUserId(Long ProjectId, Long UserId);

//    Optional<ProjectParticipant> findByUserId(Long userId);

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

    int countByUserAndProject_Status(User user, PlannerProject.Status status);

//    int countByUserAndProject_Status(User user, PlannerProject.Status.INPROGRESS);

//    int countByUserAndProject_Status(User user, PlannerProject.Status.FINISHED);
}
