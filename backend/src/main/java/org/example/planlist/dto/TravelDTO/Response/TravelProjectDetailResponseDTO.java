package org.example.planlist.dto.TravelDTO.Response;

import lombok.*;

import java.util.List;

// 최종 응답 DTO
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class TravelProjectDetailResponseDTO {
    private ProjectInfoDTO project;        // 단일 객체
    private List<ParticipantDTO> participants;
    private List<MemoDTO> memo;
}
