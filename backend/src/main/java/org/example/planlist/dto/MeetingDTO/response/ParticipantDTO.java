package org.example.planlist.dto.MeetingDTO.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParticipantDTO {
    private String name;
    private String profileImage;
}