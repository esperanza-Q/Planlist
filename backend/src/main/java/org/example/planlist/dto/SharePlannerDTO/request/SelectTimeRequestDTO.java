package org.example.planlist.dto.SharePlannerDTO.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelectTimeRequestDTO {
    private String date;     // "2025-08-05"
    private String start;    // "14:00" (선택)
    private String end;      // "17:00" (선택)
    private Boolean allDay;  // true or false
}