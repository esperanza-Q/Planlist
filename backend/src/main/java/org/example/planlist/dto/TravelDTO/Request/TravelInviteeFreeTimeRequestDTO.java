package org.example.planlist.dto.TravelDTO.Request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TravelInviteeFreeTimeRequestDTO {
    private Long inviteeId;       // 사용자 ID
    private List<FreeTimeItem> freeTimes; // 여러 날짜 가능

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FreeTimeItem {
        private String date;      // "2025-08-15"
        private Boolean allDay;   // 하루 종일 여부
    }
}
