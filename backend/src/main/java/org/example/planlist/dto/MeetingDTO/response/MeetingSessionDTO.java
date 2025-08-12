package org.example.planlist.dto.MeetingDTO.response;

import lombok.*;

// Meeting 세션 정보 DTO
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MeetingSessionDTO {
    private Long plannerId;
    private String title;
}
