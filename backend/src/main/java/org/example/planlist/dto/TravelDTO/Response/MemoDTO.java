package org.example.planlist.dto.TravelDTO.Response;

import lombok.*;

// 메모 정보 DTO
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class MemoDTO {
    private Long noteId;
    private String title;
    private String share; // PERSONAL / GROUP
}
