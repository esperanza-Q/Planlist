package org.example.planlist.dto.PlannerSessionDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class PlannerSessionRequestDTO {

    @NotNull
    private Long projectId;

    @NotBlank
    private String title;

    private Integer week;
    private LocalDate date;
    private LocalTime time;
    private String location;

    @NotNull
    private Boolean isFinalized;
}
