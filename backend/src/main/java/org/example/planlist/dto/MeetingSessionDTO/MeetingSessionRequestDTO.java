package org.example.planlist.dto.MeetingSessionDTO;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.example.planlist.dto.PlannerSessionDTO.PlannerSessionRequestDTO;
import org.example.planlist.entity.MeetingSession;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MeetingSessionRequestDTO extends PlannerSessionRequestDTO {

    @NotNull
    private Boolean isRecurring;

    @NotNull
    private MeetingSession.RecurrenceUnit recurrenceUnit;

    @NotNull
    private Integer recurrenceCount;
}
