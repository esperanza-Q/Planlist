package org.example.planlist.dto.NoteDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.example.planlist.entity.Note;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class NoteDTO {
    private Long noteId;

    @NotNull
    private Long projectId;

    @NotNull
    private Long userId;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private List<MultipartFile> images; // 업로드용 Multipart 리스트

    private List<String> imageUrls; // 저장된 S3 URL 리스트

    @NotNull
    private Note.Share share;
}
