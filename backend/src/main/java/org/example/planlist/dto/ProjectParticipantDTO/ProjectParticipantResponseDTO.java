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

//    private Long inviteeId;
//    private Long projectId;
//    private Long userId;
    private ProjectParticipant.Response response;
//    private LocalDateTime responseAt;
    private ProjectParticipant.Role role;
}
