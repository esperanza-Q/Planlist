package org.example.planlist.dto.TravelDTO.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.planlist.entity.PlannerProject;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TravelCreateResponseDTO {
    private Long projectId;
    private Long creatorId;
    private String title;
    private PlannerProject.Category category; // "TRAVEL"
    private PlannerProject.Status status; // "PLANNING"
    private LocalDateTime createdAt;
}