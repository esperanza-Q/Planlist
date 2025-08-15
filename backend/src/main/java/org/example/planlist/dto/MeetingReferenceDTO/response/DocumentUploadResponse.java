package org.example.planlist.dto.MeetingReferenceDTO.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadResponse {
    private String key;          // files/UUID_name.ext
    private String url;          // S3 정적 URL (private면 403)
    private String fileName;     // 원본 파일명(정제 후)
    private String contentType;  // MIME
    private long size;           // 바이트 수
}