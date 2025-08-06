package org.example.planlist.dto.NoteDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.PlannerProject;

@Data
@AllArgsConstructor
public class NoteSimpleResponseDTO {
    private Long noteId;
    private String projectName;
    private String title;
    private PlannerProject.Category category;
    private Note.Share share;
}