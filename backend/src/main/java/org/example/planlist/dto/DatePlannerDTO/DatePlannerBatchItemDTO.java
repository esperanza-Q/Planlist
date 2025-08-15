package org.example.planlist.dto.DatePlannerDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerRequestDTO;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesRequestDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatePlannerBatchItemDTO {
    @NotNull(message = "날짜를 선택해주세요.")
    private LocalDate date;

    @NotNull(message = "카테고리를 선택해주세요.")
    private String category;

    private String memo;
    private Long cost;
    private String address;
    private Float latitude;
    private Float longitude;
    private LocalDateTime visitTime;

    // createdAt은 서버에서 @PrePersist로 자동 설정되므로 요청 DTO에는 불필요
    // private LocalDateTime createdAt;

    // projectId는 이미 @PathVariable로 받는 경우가 많아서 request body에는 보통 불필요
    // private Long projectId;

    private Long wishlistId;
    private Long inviteeId; // participantId로 명확히 변경 가능

    private List<MoveBetweenPlacesRequestDTO> transportations;

}
