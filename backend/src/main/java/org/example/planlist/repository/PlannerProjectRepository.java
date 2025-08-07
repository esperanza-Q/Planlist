package org.example.planlist.repository;

import org.example.planlist.entity.PlannerProject;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface PlannerProjectRepository extends JpaRepository<PlannerProject, Long> {
    Optional<PlannerProject> findById(Long projectId);
}
=======

public interface PlannerProjectRepository extends JpaRepository<PlannerProject, Long> {
}
>>>>>>> 2574e59 (WIP: 작업 중인 변경사항)
