package org.example.planlist.service.Note;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.NoteDTO.NoteDTO;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;
import org.example.planlist.repository.NoteRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.security.SecurityUtil;
import org.example.planlist.service.S3Service;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j

public class NoteService {
    private final NoteRepository noteRepository;
    private final S3Service s3Service;
    private final PlannerProjectRepository plannerProjectRepository;

    public Optional<Note> findByBoardId(Long noteId) {
        return noteRepository.findByNoteId(noteId);
    }

//    public void WriteNote(NoteDTO noteDTO, Long projectId) {
//        User writer = SecurityUtil.getCurrentUser();
//        PlannerProject plannerProject = plannerProjectRepository.findByProjectId(projectId);
//
//        Note note = Note.builder()
//                .project(plannerProject)
//                .title(noteDTO.getTitle())
//                .content(noteDTO.getContent())
//                .user(writer)
//                .build();
//        noteRepository.save(note);
//    }

    @Transactional
    public void putNote(NoteDTO noteDTO) {
        Note note = Note.builder()
                .noteId(noteDTO.getNoteId())
                .title(noteDTO.getTitle())
                .content(noteDTO.getContent())
                .build();

        noteRepository.save(note);
    }

    @Transactional
    public void WriteNote(NoteDTO request) throws IOException {
        User writer = SecurityUtil.getCurrentUser();
        PlannerProject plannerProject = plannerProjectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 프로젝트입니다."));

        // ✅ S3에 이미지 업로드 후 URL 리스트로 저장
        List<String> savedImageURIs = new ArrayList<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile file : request.getImages()) {
                String uploadedUrl = s3Service.upload(file);
                savedImageURIs.add(uploadedUrl);
            }
        }

        // ✅ Note 생성 및 저장
        Note note = Note.builder()
                .project(plannerProject)
                .title(request.getTitle())
                .content(request.getContent())
                .share(request.getShare())
                .user(writer)
                .image(savedImageURIs)
                .build();

        noteRepository.save(note);
    }


    @Transactional
    public String getFileUrl(Long noteId) {
        Note note = noteRepository.findByNoteId(noteId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시물입니다."));

        //원래 이미지파일이 String일 때 사용하던 코드
//        String fileName = board.getImage();
//        return s3Service.getFileUrl(fileName);

        //여긴 JSON 형식으로 바꾼 후 사용하는 코드
        List<String> images = note.getImage();
        if (images != null && !images.isEmpty()) {
            return s3Service.getFileUrl(images.get(0)); // 첫 번째 이미지 반환
        } else {
            return null; // 또는 기본 URL 반환
        }
    }

    @Transactional
    // 일반 게시물 삭제와 사진 게시물 삭제를 하나로 합쳤다
    public void deleteBoard(Long noteId) {
        Note note = noteRepository.findByNoteId(noteId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시물입니다."));

        //원래 이미지파일이 String일 때 사용하던 코드
//        if(board.getImage() != null && !board.getImage().isEmpty()) {
//            s3Service.deleteFile(board.getImage());
//        }

        //여긴 JSON 형식으로 바꾼 후 사용하는 코드
        if (note.getImage() != null && !note.getImage().isEmpty()) {
            for (String fileName : note.getImage()) {
                s3Service.deleteFile(fileName); // ✅ 여러 이미지 삭제
            }
        }

        noteRepository.deleteByNoteId(noteId);
    }
}