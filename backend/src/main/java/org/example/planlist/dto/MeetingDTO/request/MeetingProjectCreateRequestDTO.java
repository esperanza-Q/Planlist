package org.example.planlist.dto.MeetingDTO.request;

import lombok.Data;
import org.example.planlist.entity.ProjectParticipant;

@Data
public class MeetingProjectCreateRequestDTO {
    private String title;
    private ProjectParticipant.Role role; // TRAINER 또는 TRAINEE
}