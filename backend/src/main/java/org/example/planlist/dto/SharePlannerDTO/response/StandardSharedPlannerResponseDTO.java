package org.example.planlist.dto.SharePlannerDTO.response;

import lombok.*;
import org.example.planlist.dto.StandardDTO.response.FreeTimeIntervalDTO;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class StandardSharedPlannerResponseDTO {
    private String week; // "2025-08-04 ~ 2025-08-10"
    private List<FreeTimeIntervalDTO> ALL;
//    private List<FreeTimeIntervalDTO> notOne;
}
