package org.example.planlist.dto.WishlistDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistRequestDTO {

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    @NotBlank(message = "주소를 입력해주세요.")
    private String address;

    @NotNull(message = "위도를 입력해주세요.")
    private Float latitude;

    @NotNull(message = "경도를 입력해주세요.")
    private Float longitude;

    private String memo;     // optional
    private Integer cost;    // optional
}

// category 및 projectId는 pathVariable로 받기 때문에 없앴습니다.