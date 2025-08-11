package org.example.planlist.dto.PT.response;

import lombok.*;

// PT 세션 정보 DTO
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class PtSessionDTO {
    private Long plannerId;
    private String title;
}
