package org.example.planlist.dto.HomeDTO;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import org.example.planlist.dto.FreeTimeCalendarDTO.response.FreeTimeResponseDTO;

import java.util.List;

@Getter
@Builder
@Data
public class HomeResponseDTO {
    private ProjectCountDTO projectCount;
    private List<FreeTimeResponseDTO> freeTimeCalendar;
    private List<ProjectOverviewDTO> projectOverview;
}