package org.example.planlist.service.Note;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.NoteDTO.NoteDTO;
import org.example.planlist.dto.NoteDTO.NoteUpdateDTO;
import org.example.planlist.dto.NoteDTO.response.NoteDetailResponseDTO;
import org.example.planlist.dto.NoteDTO.response.NoteSimpleResponseDTO;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;
import org.example.planlist.repository.NoteRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.security.SecurityUtil;
import org.example.planlist.service.S3Service;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j

public class NoteService {
    private final NoteRepository noteRepository;
    private final S3Service s3Service;
    private final PlannerProjectRepository plannerProjectRepository;
    private final ProjectParticipantRepository participantRepository;

    public Optional<Note> findByBoardId(Long noteId) {
        return noteRepository.findByNoteId(noteId);
    }

//    @Transactional
//    public void putNote(NoteUpdateDTO noteUpdateDTO) throws IOException {
//        Note note = noteRepository.findByNoteId(noteUpdateDTO.getNoteId())
//                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시물입니다."));
//
////        noteUpdateDTO.setImages(note.getImage());
//
//        // 제목, 내용, 공개범위 수정
//        note.update(
//                noteUpdateDTO.getTitle(),
//                noteUpdateDTO.getContent(),
//                Note.Share.valueOf(noteUpdateDTO.getShare())
//        );
//
//        // 기존 이미지 URL 리스트 복사
//        List<String> currentImageUrls = noteUpdateDTO.getImageUrls() != null
//                ? new ArrayList<>(noteUpdateDTO.getImageUrls())
//                : new ArrayList<>();
//
//        // ✅ 삭제할 이미지 처리
//        if (noteUpdateDTO.getDeleteImages() != null && !noteUpdateDTO.getDeleteImages().isEmpty()) {
//            for (String urlToDelete : noteUpdateDTO.getDeleteImages()) {
//                boolean removed = currentImageUrls.remove(urlToDelete);
//                if (removed) {
//                    try {
//                        String key = s3Service.getKeyUrl(urlToDelete);
//                        s3Service.deleteFile(key);
//                    } catch (Exception e) {
//                        log.error("S3 이미지 삭제 실패: {}", urlToDelete, e);
//                    }
//                }
//            }
//        }
//
//        // ✅ 새 이미지 업로드 처리
//        if (noteUpdateDTO.getImages() != null && !noteUpdateDTO.getImages().isEmpty()) {
//            for (MultipartFile image : noteUpdateDTO.getImages()) {
//                String url = s3Service.upload(image);
//                currentImageUrls.add(url);
//            }
//        }
//
//        // ✅ 변경된 이미지 리스트 저장
//        note.setImage(currentImageUrls);
//        noteRepository.save(note); // 명시적 저장
//    }

    @Transactional
    public void putNote(NoteUpdateDTO noteUpdateDTO) throws IOException {
        // 1️⃣ 노트 조회
        Note note = noteRepository.findByNoteId(noteUpdateDTO.getNoteId())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시물입니다."));

        // 2️⃣ 제목, 내용, 공유 범위 업데이트
        note.update(
                noteUpdateDTO.getTitle(),
                noteUpdateDTO.getContent(),
                Note.Share.valueOf(noteUpdateDTO.getShare())
        );

        // 3️⃣ 기존 이미지 URL 복사
        List<String> updatedImages = note.getImage() != null
                ? new ArrayList<>(note.getImage())
                : new ArrayList<>();

        // 4️⃣ 삭제할 이미지 처리
        if (noteUpdateDTO.getDeleteImages() != null && !noteUpdateDTO.getDeleteImages().isEmpty()) {
            for (String urlToDelete : noteUpdateDTO.getDeleteImages()) {
                if (updatedImages.remove(urlToDelete)) {
                    try {
                        String key = s3Service.getKeyUrl(urlToDelete);
                        s3Service.deleteFile(key);
                    } catch (Exception e) {
                        log.error("S3 이미지 삭제 실패: {}", urlToDelete, e);
                    }
                }
            }
        }

        // 5️⃣ 새 이미지 업로드
        if (noteUpdateDTO.getImages() != null && !noteUpdateDTO.getImages().isEmpty()) {
            for (MultipartFile image : noteUpdateDTO.getImages()) {
                String url = s3Service.upload(image);
                updatedImages.add(url);
            }
        }

        // 6️⃣ 최종 이미지 리스트 저장
        note.setImage(updatedImages);

        // 7️⃣ 저장 (JPA 영속성 때문에 사실 필요없지만 명시적으로 저장)
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
    public void deleteNote(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시물입니다."));

        if (note.getImage() != null && !note.getImage().isEmpty()) {
            for (String imageUrl : note.getImage()) {
                String key = s3Service.getKeyUrl(imageUrl);  // URL → key 변환
                s3Service.deleteFile(key);
            }
        }

        noteRepository.delete(note);
    }

    public NoteDetailResponseDTO getNoteDetail(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("해당 노트를 찾을 수 없습니다."));

        NoteDetailResponseDTO dto = new NoteDetailResponseDTO();
        dto.setNoteId(note.getNoteId());
        dto.setProjectName(note.getProject().getProjectTitle());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setCategory(note.getProject().getCategory());
        dto.setShare(note.getShare());
        dto.setImageUrls(note.getImage());  // image 컬렉션 반환

        return dto;
    }

    public List<NoteSimpleResponseDTO> getUserNotes() {

        User user = SecurityUtil.getCurrentUser();

        List<Note> notes = noteRepository.findVisibleNotesForUser(user.getId());

        return notes.stream()
                .map(note -> new NoteSimpleResponseDTO(
                        note.getNoteId(),
                        note.getProject().getProjectTitle(),
                        note.getTitle(),
                        note.getProject().getCategory(),
                        note.getShare()
                ))
                .collect(Collectors.toList());
    }

//    public List<NoteSimpleResponseDTO> getUserNotes() {
//        User user = SecurityUtil.getCurrentUser();
//
//        // 유저가 속한 프로젝트 ID 목록 가져오기
//        List<Long> projectIds = participantRepository
//                .findByUser(user)
//                .stream()
//                .map(pp -> pp.getProject().getProjectId())
//                .collect(Collectors.toList());
//
//        // 모든 노트 불러오기
//        List<Note> notes = noteRepository.findAll();
//
//        return notes.stream()
//                .filter(note ->
//                        note.getUser().getId().equals(user.getId()) // 내가 작성한 노트
//                                || (projectIds.contains(note.getProject().getProjectId())
//                                && note.getShare() == Note.Share.GROUP) // 같은 프로젝트 + GROUP
//                )
//                .map(note -> new NoteSimpleResponseDTO(
//                        note.getNoteId(),
//                        note.getProject().getProjectTitle(),
//                        note.getTitle(),
//                        note.getProject().getCategory(),
//                        note.getShare()
//                ))
//                .collect(Collectors.toList());
//    }


    private String extractKeyFromUrl(String url) {
        String bucketUrlPrefix = "https://planlistbucket.s3.ap-northeast-2.amazonaws.com/";
        if (url.startsWith(bucketUrlPrefix)) {
            return url.substring(bucketUrlPrefix.length());
        }
        throw new IllegalArgumentException("잘못된 S3 URL: " + url);
    }
}

