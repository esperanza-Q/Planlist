package org.example.planlist.dto.StandardDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.planlist.entity.PlannerProject;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class StandardProjectCreateResponseDTO {
    private Long projectId;
    private Long creatorId;
    private String title;
    private PlannerProject.Category category; // "STANDARD"
    private PlannerProject.Status status; // "PLANNING"
    private LocalDateTime createdAt;
}
