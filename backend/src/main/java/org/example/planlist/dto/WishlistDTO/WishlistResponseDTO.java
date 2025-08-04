package org.example.planlist.dto.WishlistDTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponseDTO {

    private String name;
    private String address;
    private Float latitude;
    private Float longitude;
    private String category; // enum 문자열로 넘겨받기
    private String memo;     // 메모는 optional
    private Integer cost;    // 비용도 optional
    private Long projectId;
    private Long inviteeId;

}
