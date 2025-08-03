package org.example.planlist.repository;

import org.example.planlist.entity.ExercisePlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExercisePlanRepository extends JpaRepository<ExercisePlan, Long> {
    Optional<ExercisePlan> findByExercisePlanId(Long exercisePlanId);
}
