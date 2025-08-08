package org.example.planlist.dto.WishlistDTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistRequestDTO {
    @NotNull(message = "위시리스트 ID가 필요합니다.")
    private Long wishlistId;

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    @NotBlank(message = "주소를 입력해주세요.")
    private String address;

    @NotNull(message = "위도를 입력해주세요.")
    private Float latitude;

    @NotNull(message = "경도를 입력해주세요.")
    private Float longitude;

    @NotNull(message = "카테고리를 선택해주세요.")
    private String category; // enum 문자열로 넘겨받기

    private String memo;     // 메모는 optional

    private Integer cost;    // 비용도 optional

    @NotNull(message = "프로젝트 ID가 필요합니다.")
    private Long projectId;

    @NotNull(message = "초대받은 사용자 ID가 필요합니다.")
    private Long inviteeId;
}
