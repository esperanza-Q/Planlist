package org.example.planlist.controller.Meeting;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MeetingReferenceDTO.request.DocumentDeleteRequest;
import org.example.planlist.dto.MeetingReferenceDTO.response.DocumentUploadResponse;
import org.example.planlist.dto.MeetingReferenceDTO.response.DocumentUrlResponse;
import org.example.planlist.service.DocumentS3Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;


@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentS3Service documentS3Service;

    /** 업로드 (멀티파트)
     * curl -F "file=@/path/a.pdf" "http://localhost:8080/api/documents?dir=files/reports"
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentUploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(name = "dir", defaultValue = "files") String dir
    ) throws IOException {

        String url = documentS3Service.upload(file, dir);
        String key = documentS3Service.getKeyFromUrlOrKey(url);

        DocumentUploadResponse body = DocumentUploadResponse.builder()
                .key(key)
                .url(url)
                .fileName(Optional.ofNullable(file.getOriginalFilename()).orElse("document"))
                .contentType(file.getContentType())
                .size(file.getSize())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /** 열람용 URL 조회(정적 URL 생성)
     *  버킷이 public일 때만 브라우저에서 바로 열림
     * curl "http://localhost:8080/api/documents/url?key=files/UUID_a.pdf"
     */
    @GetMapping("/url")
    public ResponseEntity<DocumentUrlResponse> getUrl(@RequestParam("key") String key) {
        String url = documentS3Service.getFileUrl(key);
        return ResponseEntity.ok(DocumentUrlResponse.builder().key(key).url(url).build());
    }

    /** 삭제 (JSON Body로 URL 또는 key 전달)
     * curl -X DELETE -H "Content-Type: application/json" \
     *   -d '{"urlOrKey":"files/UUID_a.pdf"}' http://localhost:8080/api/documents
     */
    @DeleteMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> delete(@Valid @RequestBody DocumentDeleteRequest req) {
        documentS3Service.delete(req.getUrlOrKey());
        return ResponseEntity.noContent().build();
    }

    /** 삭제(경로변수로 key 전달) — 선택형
     * curl -X DELETE "http://localhost:8080/api/documents/files/UUID_a.pdf"
     */
    @DeleteMapping("/{*key}")
    public ResponseEntity<Void> deleteByKey(@PathVariable("key") String key) {
        documentS3Service.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }
}