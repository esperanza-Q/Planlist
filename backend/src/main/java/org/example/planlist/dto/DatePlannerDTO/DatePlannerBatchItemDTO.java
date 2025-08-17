package org.example.planlist.dto.DatePlannerDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerRequestDTO;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesRequestDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// 프론트엔드에서 보내는 여러 항목을 한 번에 담아서 보내는 배치 아이템 DTO

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

    private Long wishlistId;

    // inviteeId 대신 현재 로그인한 유저의 토큰을 이용해 검증할 예정이라 지웠습니다!

    private List<MoveBetweenPlacesRequestDTO> transportations;

}
