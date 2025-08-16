package org.example.planlist.dto.HomeDTO;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@Data
public class ProjectOverviewDTO {
    private String projectTitle;
    private String category;
    private String status;
    private LocalDate startDate; // "MM/dd~MM/dd"
    private LocalDate endDate; // "MM/dd~MM/dd"
}
