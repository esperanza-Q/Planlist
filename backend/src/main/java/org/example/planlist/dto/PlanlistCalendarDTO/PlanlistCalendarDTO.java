package org.example.planlist.dto.PlanlistCalendarDTO;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Builder
@Data
public class PlanlistCalendarDTO {
    private LocalDate date;
    private List<PlanlistProjectsDTO> planlistCalendar;
}
