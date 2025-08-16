package org.example.planlist.dto.PtDTO.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentDTO {
    private Long commentId;
    private String name;
    private String profileImage;
    private String role; // TRAINER/TRAINEE
    private String content;
}
