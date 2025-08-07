package org.example.planlist.dto.ProfileDTO;

import lombok.Data;

@Data
public class ProjectRequestDTO {
    private Long inviteeId;
    private String projectTitle;
    private String creator;
}