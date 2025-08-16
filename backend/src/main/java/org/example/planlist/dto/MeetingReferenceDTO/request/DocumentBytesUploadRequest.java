package org.example.planlist.dto.MeetingReferenceDTO.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class DocumentBytesUploadRequest {
    @NotBlank
    private String base64;       // 데이터(Base64)
    @NotBlank
    private String fileName;     // 예: sample.pdf
    @NotBlank
    private String contentType;  // 예: application/pdf
    private String dirName = "files";
}