package org.example.planlist.dto.MeetingSessionDTO;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.example.planlist.dto.PlannerSessionDTO.PlannerSessionResponseDTO;
import org.example.planlist.entity.MeetingSession;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MeetingSessionResponseDTO extends PlannerSessionResponseDTO {

    private Boolean isRecurring;
    private MeetingSession.RecurrenceUnit recurrenceUnit;
    private Integer recurrenceCount;
}
