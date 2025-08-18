package org.example.planlist.dto.DatePlannerDTO;

import lombok.*;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesResponseDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatePlannerResponseDTO {
    private Long calendarId;
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
    private String wishlistName;

    // ✅ 조회 시 함께 내려줄 교통수단
    private List<MoveBetweenPlacesResponseDTO> transportations;
}
