package org.example.planlist.dto.PlannerSessionDTO;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class PlannerSessionResponseDTO {

    private Long plannerId;
    private Long projectId;
    private String title;
    private Integer week;
    private LocalDate date;
    private LocalTime time;
    private String location;
    private Boolean isFinalized;
}
