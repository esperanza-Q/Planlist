package org.example.planlist.dto.PT.request;

import lombok.Data;
import org.example.planlist.entity.ProjectParticipant;

@Data
public class PtProjectCreateRequestDTO {
    private String title;
    private ProjectParticipant.Role role; // TRAINER 또는 TRAINEE
}
