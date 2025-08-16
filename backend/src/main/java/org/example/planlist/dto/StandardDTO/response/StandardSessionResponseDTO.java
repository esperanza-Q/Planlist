package org.example.planlist.dto.StandardDTO.response;

import lombok.*;
import org.example.planlist.dto.StandardDTO.response.ParticipantDTO;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StandardSessionResponseDTO {
    private String title;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<ParticipantDTO> participants;
}

