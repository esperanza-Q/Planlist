package org.example.planlist.dto.SidebarDTO;

import lombok.*;
import org.example.planlist.entity.PlannerProject;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NextEventDTO {
    private String title;
    private LocalTime startTime;
    private LocalTime endTime;
    private PlannerProject.Category category;
}