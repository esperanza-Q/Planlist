package org.example.planlist.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentS3Service {

    // s3Client 주입: S3에 파일 업/다운/삭제할 때 사용
    private final S3Client s3Client;

    // 버킷 이름
    @Value("${cloud.aws.s3.bucket-name}")
    private String bucket;

    /**
     * 문서 업로드 (pdf/hwp/doc/docx 등)
     * - files/{UUID}_{원본파일명.확장자} 형태로 업로드
     * - 업로드된 파일의 S3 URL을 반환 (버킷이 private이면 직접 접근은 불가)
     */
    public String upload(MultipartFile multipartFile) throws IOException {
        return upload(multipartFile, "files");
    }

    // 폴더 지정 버전 (ex. files/contracts, files/reports 등)
    public String upload(MultipartFile multipartFile, String dirName) throws IOException {
        String original = Optional.ofNullable(multipartFile.getOriginalFilename()).orElse("document");
        String sanitized = sanitizeFilename(original); // 경로 제거 + 특수문자 치환
        String key = dirName + "/" + UUID.randomUUID() + "_" + sanitized;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(multipartFile.getContentType()) // application/pdf 등
                // (선택) 브라우저/다운로드 시 원본 파일명이 보이도록 힌트
                .contentDisposition("inline; filename=\"" + sanitized + "\"")
                .build();

        // 스트리밍 업로드(대용량도 메모리 부담 적음)
        s3Client.putObject(
                putObjectRequest,
                RequestBody.fromInputStream(multipartFile.getInputStream(), multipartFile.getSize())
        );

        // 업로드된 S3 URL 반환
        GetUrlRequest request = GetUrlRequest.builder().bucket(bucket).key(key).build();
        return s3Client.utilities().getUrl(request).toString();
    }

    /**
     * 바이트 배열 업로드 (문서 변환/크롤링 등으로 얻은 바이트 저장 시)
     //     * @param data 저장할 데이터
     //     * @param fileName 원본 파일명(확장자 포함 권장)
     //     * @param contentType MIME 타입 (예: application/pdf)
     */
    public String upload(byte[] data, String fileName, String contentType) {
        return upload(data, fileName, contentType, "files");
    }

    public String upload(byte[] data, String fileName, String contentType, String dirName) {
        String sanitized = sanitizeFilename(Optional.ofNullable(fileName).orElse("document"));
        String key = dirName + "/" + UUID.randomUUID() + "_" + sanitized;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .contentDisposition("inline; filename=\"" + sanitized + "\"")
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(data));

        GetUrlRequest request = GetUrlRequest.builder().bucket(bucket).key(key).build();
        return s3Client.utilities().getUrl(request).toString();
    }

    /** key로 URL 얻기(버킷 공개 상태에서만 직접 열람 가능) */
    public String getFileUrl(String key) {
        GetUrlRequest request = GetUrlRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        return s3Client.utilities().getUrl(request).toString();
    }

    /**
     * URL 또는 key를 받아 S3 key만 추출
     * - URL 형식: https://{bucket}.s3.{region}.amazonaws.com/files/UUID_name.ext
     * - 반환: files/UUID_name.ext
     */
    public String getKeyFromUrlOrKey(String urlOrKey) {
        if (urlOrKey == null || urlOrKey.isBlank()) return urlOrKey;

        // 이미 key 형태면 그대로 반환
        if (!urlOrKey.startsWith("http")) return urlOrKey;

        try {
            URL parsedUrl = new URL(urlOrKey);
            String path = parsedUrl.getPath(); // "/files/UUID_name.ext"
            if (path == null || path.isBlank()) return null;
            return path.startsWith("/") ? path.substring(1) : path;
        } catch (MalformedURLException e) {
            // 비정상 URL이면 원문을 key로 간주(호환성)
            return urlOrKey;
        }
    }

    /** URL 또는 key로 삭제 */
    public void delete(String urlOrKey) {
        if (urlOrKey == null || urlOrKey.isBlank()) return;

        String key = getKeyFromUrlOrKey(urlOrKey);
        if (key == null || key.isBlank()) return;

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        s3Client.deleteObject(deleteRequest);
    }

    /** key로만 삭제(확실히 key일 때) */
    public void deleteByKey(String key) {
        if (key == null || key.isBlank()) return;

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }

    /** 파일명 정제: 경로 제거 + 특수문자 치환 (원본 확장자 유지) */
    private String sanitizeFilename(String name) {
        String base = Paths.get(name).getFileName().toString(); // 경로 제거
        // 공백/한글을 허용하고 싶으면 정책에 맞게 완화 가능
        return base.replaceAll("[^A-Za-z0-9가-힣._-]", "_");
    }
}
