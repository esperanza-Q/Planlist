package org.example.planlist.dto.DatePlannerDTO;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatePlannerResponseDTO {
    private LocalDate date;
    private String category;
    private String memo;
    private Long cost;
    private String address;
    private Float latitude;
    private Float longitude;
    private LocalDateTime visitTime;
    private LocalDateTime createdAt;
    private Long projectId;
    private Long wishlistId;
}
