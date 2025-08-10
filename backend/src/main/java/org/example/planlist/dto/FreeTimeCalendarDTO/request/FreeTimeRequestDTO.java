package org.example.planlist.dto.FreeTimeCalendarDTO.request;

import lombok.Data;
import org.example.planlist.dto.FreeTimeCalendarDTO.FreeTimeDTO;

import java.util.List;

@Data
public class FreeTimeRequestDTO {
    private String week; // 사용 안 하더라도 받아는 둠
    private List<FreeTimeDTO> freeTimeCalendar;
}
