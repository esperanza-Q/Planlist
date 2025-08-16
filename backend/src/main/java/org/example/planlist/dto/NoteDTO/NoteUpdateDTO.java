package org.example.planlist.dto.NoteDTO;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class NoteUpdateDTO {
    private Long noteId;
    private String title;
    private String content;
    private String share; // 공개 범위
    private List<String> imageUrls; // 기존 이미지 URL 리스트
    private List<String> deleteImages; // 삭제할 이미지 URL 리스트
    private List<MultipartFile> images; // 새로 업로드할 이미지 파일 리스트

    // getters / setters
}
