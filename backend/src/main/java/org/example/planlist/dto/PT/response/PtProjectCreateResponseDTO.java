package org.example.planlist.dto.PT.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.planlist.entity.PlannerProject;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PtProjectCreateResponseDTO {
    private Long projectId;
    private Long creatorId;
    private String title;
    private PlannerProject.Category category; // "PT"
    private PlannerProject.Status status; // "PLANNING"
    private LocalDateTime createdAt;
}
