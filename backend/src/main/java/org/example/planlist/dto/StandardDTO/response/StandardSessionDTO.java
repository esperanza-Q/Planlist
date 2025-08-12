package org.example.planlist.dto.StandardDTO.response;

import lombok.*;

// Standard 세션 정보 DTO
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StandardSessionDTO {
    private Long plannerId;
    private String title;
}
