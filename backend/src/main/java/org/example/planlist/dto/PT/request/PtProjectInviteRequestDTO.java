package org.example.planlist.dto.PT.request;

import lombok.Data;
import org.example.planlist.entity.ProjectParticipant;

@Data
public class PtProjectInviteRequestDTO {
    private String email;
    private ProjectParticipant.Role role;
}
