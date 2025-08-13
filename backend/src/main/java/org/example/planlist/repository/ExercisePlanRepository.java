package org.example.planlist.repository;

import org.example.planlist.dto.PtDTO.response.MyExerciseDTO;
import org.example.planlist.entity.Exercise;
import org.example.planlist.entity.ExercisePlan;
import org.example.planlist.entity.PtSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExercisePlanRepository extends JpaRepository<ExercisePlan, Long> {
    Optional<ExercisePlan> findByExercisePlanId(Long exercisePlanId);

    List<ExercisePlan> findByPlanner(PtSession planner);


}
