package org.example.planlist.dto.TravelDTO.Response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectInfoDTO {
    private Long projectId;
    private String projectName;
    private String category;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime confirmedAt;
}
