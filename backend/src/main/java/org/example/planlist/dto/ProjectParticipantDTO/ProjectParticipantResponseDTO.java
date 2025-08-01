package org.example.planlist.dto.ProjectParticipantDTO;

import lombok.*;
import org.example.planlist.entity.ProjectParticipant;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectParticipantResponseDTO {

    private ProjectParticipant.Response response;
    private ProjectParticipant.Role role;
}
