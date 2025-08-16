package org.example.planlist.dto.DatePlannerDTO;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatePlannerBatchSaveResultDTO {
    private List<Long> datePlannerIds;
    private List<Long> moveBetweenPlacesIds;
}
