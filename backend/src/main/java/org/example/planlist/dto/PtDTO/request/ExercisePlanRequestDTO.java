package org.example.planlist.dto.PtDTO.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.planlist.entity.ExercisePlan;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExercisePlanRequestDTO {
//    private ExercisePlan.TYPE type;
    private Long exerciseId;
//    private String name;
//    private String exerciseName;
    private Integer time;
    private Integer sets;
}
