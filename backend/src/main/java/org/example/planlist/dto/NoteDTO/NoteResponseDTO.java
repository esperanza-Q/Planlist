package org.example.planlist.dto.NoteDTO;

import lombok.*;
import org.example.planlist.entity.Note;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteResponseDTO {

    private String title;
    private String content;
    private String image;
    private Note.Share share;
}
