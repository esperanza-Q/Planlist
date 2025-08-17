package org.example.planlist.dto.TravelDTO.Response;

import lombok.*;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerResponseDTO;

import java.util.List;

// 최종 응답 DTO
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class TravelProjectDetailResponseDTO {
    private ProjectInfoDTO project;        // 단일 객체
    private List<ParticipantDTO> participants;
    private List<MemoDTO> memo;
    private List<DatePlannerResponseDTO> projectDetails;
}
