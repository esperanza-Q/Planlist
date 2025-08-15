package org.example.planlist.dto.PtDTO.response;

import lombok.*;

// PT 세션 정보 DTO
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class PtSessionDTO {
    private Long plannerId;
    private String title;
    private boolean is_finalized;
}
