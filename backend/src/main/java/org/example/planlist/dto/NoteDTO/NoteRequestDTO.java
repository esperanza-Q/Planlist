package org.example.planlist.dto.NoteDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.ProjectParticipant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteRequestDTO {

    @NotNull
    private Long projectId;

    @NotNull
    private Long userId;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String image;

    @NotNull
    private Note.Share share;
}
