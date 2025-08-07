package org.example.planlist.repository;

import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectCount;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectParticipantRepository extends JpaRepository<ProjectParticipant, Long> {
    List<ProjectParticipant> findByUser(User user);
    Optional<ProjectParticipant> findById(Long id);

    @Query("SELECT new org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO(" +
            "p.project.id, p.user.id, p.response, p.responseAt, p.role) " +
            "FROM ProjectParticipant p WHERE p.project.id = :projectId")
    List<ProjectParticipantRequestDTO> findAllByProjectId(@Param("projectId") Long projectId);

    boolean existsByProjectAndUser(PlannerProject project, User friend);

//import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
//import org.example.planlist.entity.PlannerProject;
//import org.example.planlist.entity.ProjectParticipant;
//import org.example.planlist.entity.User;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//import java.util.List;

//public interface ProjectParticipantRepository extends JpaRepository<ProjectParticipant, Long> {
//    @Query("SELECT new org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO(" +
//            "p.project.id, p.user.id, p.response, p.responseAt, p.role) " +
//            "FROM ProjectParticipant p WHERE p.project.id = :projectId")
//    List<ProjectParticipantRequestDTO> findAllByProjectId(@Param("projectId") Long projectId);
//
//    boolean existsByProjectAndUser(PlannerProject project, User friend);
//>>>>>>> 2574e59 (WIP: 작업 중인 변경사항)
}
