package org.example.planlist.dto.FreeTimeCalendarDTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
public class FreeTimeDTO {
    private String date;         // ex) "2025-08-05"
    private String start;        // ex) "15:00" 또는 null
    private String end;          // ex) "18:00" 또는 null
    private Boolean allDay;      // true 또는 null
}
