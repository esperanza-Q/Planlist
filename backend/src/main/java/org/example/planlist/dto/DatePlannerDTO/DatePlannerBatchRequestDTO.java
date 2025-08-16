package org.example.planlist.dto.DatePlannerDTO;

import lombok.*;

import java.util.List;

//여러 개의 DatePlannerWithTransportDTO를 감싸서 한 번에 전달
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatePlannerBatchRequestDTO {
    private List<DatePlannerBatchItemDTO> items;
}
