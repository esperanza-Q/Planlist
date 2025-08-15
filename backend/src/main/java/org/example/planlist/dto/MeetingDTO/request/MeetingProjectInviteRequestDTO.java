package org.example.planlist.dto.MeetingDTO.request;

import lombok.Data;
import org.example.planlist.entity.ProjectParticipant;

@Data
public class MeetingProjectInviteRequestDTO {
    private String email;
}
