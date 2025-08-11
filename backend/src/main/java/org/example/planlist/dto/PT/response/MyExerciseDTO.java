package org.example.planlist.dto.PT.response;

import lombok.*;
import org.example.planlist.entity.ExercisePlan;
import org.example.planlist.entity.ProjectParticipant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MyExerciseDTO {
    private Long exercisePlanId;
    private String exerciseName;
    private Integer time;
    private Integer sets;
    private ExercisePlan.TYPE type; // TRAINER_P / DONE

}
