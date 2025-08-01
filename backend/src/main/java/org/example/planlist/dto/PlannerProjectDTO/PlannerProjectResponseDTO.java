package org.example.planlist.dto.PlannerProjectDTO;

import lombok.*;
import org.example.planlist.entity.PlannerProject;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlannerProjectResponseDTO {

    private Long projectId;
    private Long creatorId;
    private String projectTitle;
    private PlannerProject.Category category;
    private PlannerProject.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDate startDate;
    private LocalDate endDate;
}
