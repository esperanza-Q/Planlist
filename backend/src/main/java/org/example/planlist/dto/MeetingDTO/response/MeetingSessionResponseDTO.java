package org.example.planlist.dto.MeetingDTO.response;

import lombok.*;
import org.example.planlist.dto.MeetingDTO.response.ParticipantDTO;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MeetingSessionResponseDTO {
    private String title;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<ParticipantDTO> participants;
}
