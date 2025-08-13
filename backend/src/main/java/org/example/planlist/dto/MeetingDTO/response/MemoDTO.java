package org.example.planlist.dto.MeetingDTO.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemoDTO {
    private Long noteId;
    private String title;
    private String share; // PERSONAL / GROUP
}