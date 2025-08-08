package org.example.planlist.dto.HomeDTO;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Builder
@Data
public class ProjectOverviewDTO {
    private String projectTitle;
    private String category;
    private String status;
    private String duration; // "MM/dd~MM/dd"
    private int days;
}
