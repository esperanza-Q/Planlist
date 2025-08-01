package org.example.planlist.dto.ParticipantAvailabilityDTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class ParticipantAvailabilityResponseDTO {
    private LocalDate date;
    private Boolean allDay;
    private LocalTime startTime;  // allDay == false일 때만 사용
    private LocalTime endTime;
}
