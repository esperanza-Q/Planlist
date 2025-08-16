package org.example.planlist.dto.TravelDTO.Request;

import lombok.Data;
import org.example.planlist.entity.ProjectParticipant;

@Data
public class TravelProjectInviteRequestDTO {
    private String email;
    private ProjectParticipant.Role role;
}
