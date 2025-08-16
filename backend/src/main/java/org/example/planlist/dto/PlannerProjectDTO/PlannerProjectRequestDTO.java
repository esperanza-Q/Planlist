package org.example.planlist.dto.PlannerProjectDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.example.planlist.entity.PlannerProject;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlannerProjectRequestDTO {

    @NotBlank
    private String projectTitle;

    @NotNull
    private PlannerProject.Category category;

    @NotNull
    private PlannerProject.Status status;

    @NotNull
    private LocalDateTime createdAt;

    private LocalDateTime confirmedAt;
    private LocalDate startDate;
    private LocalDate endDate;
}
