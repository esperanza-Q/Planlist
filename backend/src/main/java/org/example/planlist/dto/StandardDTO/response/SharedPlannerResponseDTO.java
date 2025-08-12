package org.example.planlist.dto.StandardDTO.response;

import lombok.*;
import org.example.planlist.dto.StandardDTO.response.FreeTimeIntervalDTO;

import java.util.List;


// 최종 응답 DTO
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class SharedPlannerResponseDTO {
    private String week; // "2025-08-04 ~ 2025-08-10"
    private List<FreeTimeIntervalDTO> ALL;
//    private List<FreeTimeIntervalDTO> notOne;
}