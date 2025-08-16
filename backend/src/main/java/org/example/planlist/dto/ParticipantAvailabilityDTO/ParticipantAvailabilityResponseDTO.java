package org.example.planlist.dto.ParticipantAvailabilityDTO;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class ParticipantAvailabilityResponseDTO {

    @NotNull
    private LocalDate date;

    private Boolean allDay;

    private LocalTime startTime;  // allDay == false일 때만 사용

    private LocalTime endTime;
}
