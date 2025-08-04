package org.example.planlist.dto.DatePlannerDTO;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatePlannerRequestDTO {
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
    private LocalDateTime createdAt;
    private Long projectId;
    private Long wishlistId;
}
