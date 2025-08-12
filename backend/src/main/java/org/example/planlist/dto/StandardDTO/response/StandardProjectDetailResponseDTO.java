package org.example.planlist.dto.StandardDTO.response;

import lombok.*;
import org.example.planlist.dto.StandardDTO.response.MemoDTO;
import org.example.planlist.dto.StandardDTO.response.ParticipantDTO;
import org.example.planlist.dto.StandardDTO.response.ProjectInfoDTO;
import org.example.planlist.dto.StandardDTO.response.StandardSessionDTO;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StandardProjectDetailResponseDTO {
    private List<ProjectInfoDTO> Projects;
    private List<ParticipantDTO> Participants;
    private List<StandardSessionDTO> Standard_session;
    private List<MemoDTO> Memo;
}