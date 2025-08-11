package org.example.planlist.dto.PT.response;

import lombok.*;

import java.util.List;

// 최종 응답 DTO
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class PtProjectDetailResponseDTO {
    private List<ProjectInfoDTO> Projects;
    private List<ParticipantDTO> Participants;
    private List<PtSessionDTO> PT_session;
    private List<MemoDTO> Memo;
}
