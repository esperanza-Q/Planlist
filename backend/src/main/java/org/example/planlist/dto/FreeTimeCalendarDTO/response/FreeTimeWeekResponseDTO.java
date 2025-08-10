package org.example.planlist.dto.FreeTimeCalendarDTO.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@Data
public class FreeTimeWeekResponseDTO {
    private String week;
    private List<FreeTimeResponseDTO> freeTimeCalendar;
}