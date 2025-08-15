package org.example.planlist.repository;

import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.PtSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PtSessionRepository extends JpaRepository<PtSession, Long> {
    Optional<PtSession> findById(Long id);

    List<PtSession> findByProject_ProjectId(Long projectId);


    // 프로젝트로 PT 세션 목록 조회
    List<PtSession> findByProject(PlannerProject project);


}
