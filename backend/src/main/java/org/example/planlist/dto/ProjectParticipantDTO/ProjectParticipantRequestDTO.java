package org.example.planlist.dto.ProjectParticipantDTO;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.example.planlist.entity.ProjectParticipant;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectParticipantRequestDTO {

    @NotNull
    private Long projectId;

    @NotNull
    private Long userId;

    @NotNull
    private ProjectParticipant.Response response;

    private LocalDateTime responseAt;
    private  ProjectParticipant.Role role;
}
