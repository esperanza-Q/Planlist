package org.example.planlist.dto.MoveBetweenPlacesDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveBetweenPlacesRequestDTO {
    @NotBlank(message = "타고 갈 이동 수단을 입력해주세요.")
    private String transportation;

    @NotNull(message = "이동 시간을 입력해주세요.") // Long과 LocalDate엔 NotNull
    private Long durationMin;

    @NotNull(message = "상단의 날짜를 선택해주세요.")
    private LocalDate travelDate;
}
