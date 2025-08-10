package org.example.planlist.dto.NoteDTO.response;

import lombok.*;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.PlannerProject;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteDetailResponseDTO {
    private Long noteId;
    private String project_name;
    private String title;
    private String content;
    private PlannerProject.Category Category;
    private Note.Share share;
    private List<String> imageUrls;

    public void setProjectName(String projectTitle) {
        this.project_name = projectTitle;
    }
}
