package org.example.planlist.dto.MeetingDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.planlist.entity.PlannerProject;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MeetingProjectCreateResponseDTO {
    private Long projectId;
    private Long creatorId;
    private String title;
    private PlannerProject.Category category; // "MEETING"
    private PlannerProject.Status status; // "PLANNING"
    private LocalDateTime createdAt;
}

