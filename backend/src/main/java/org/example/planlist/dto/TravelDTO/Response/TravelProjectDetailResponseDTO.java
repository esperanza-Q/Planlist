package org.example.planlist.dto.TravelDTO.Response;

import lombok.*;

import java.util.List;

// 최종 응답 DTO
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class TravelProjectDetailResponseDTO {
    private List<ProjectInfoDTO> Projects;
    private List<ParticipantDTO> Participants;
    private List<MemoDTO> Memo;
}
