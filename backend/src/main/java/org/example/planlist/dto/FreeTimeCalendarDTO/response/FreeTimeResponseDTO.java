package org.example.planlist.dto.FreeTimeCalendarDTO.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Builder
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FreeTimeResponseDTO {
    private String date;
    private String start;     // nullable
    private String end;       // nullable
    private Boolean allDay;   // nullable
}
