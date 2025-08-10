package org.example.planlist.controller.Note;

import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.NoteDTO.NoteDTO;
import org.example.planlist.dto.NoteDTO.NoteUpdateDTO;
import org.example.planlist.dto.NoteDTO.response.NoteDetailResponseDTO;
import org.example.planlist.dto.NoteDTO.response.NoteSimpleResponseDTO;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.User;
import org.example.planlist.security.SecurityUtil;
import org.example.planlist.service.Note.NoteService;
import org.example.planlist.service.S3Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;


@Slf4j
@RestController
@RequestMapping("/api/note")
@RequiredArgsConstructor

public class NoteController {
    private final NoteService noteService;
    private final S3Service s3Service;


    @GetMapping("/")
    public ResponseEntity<List<NoteSimpleResponseDTO>> getUserNotes() {
        return ResponseEntity.ok(noteService.getUserNotes());
    }


    @GetMapping("/getNote")
    public ResponseEntity<NoteDetailResponseDTO> getNoteDetail(@RequestParam(name = "noteId") Long noteId) {
        return ResponseEntity.ok(noteService.getNoteDetail(noteId));
    }


//    @PostMapping("/writeNote")
//    public void writeNote(@RequestParam(name = "projectId") Long projectId, @RequestBody NoteDTO noteDTO) throws IOException {
//
//        noteService.WriteNote(noteDTO);
//    }

//    @PutMapping(value = "/updateNote", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public void updateNote(@ModelAttribute NoteDTO noteDTO) throws IOException {
//        noteService.putNote(noteDTO);
//    }

    @PutMapping(value = "/updateNote", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateNote(
            @RequestPart("noteUpdateDTO") NoteUpdateDTO noteUpdateDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        // 현재 로그인한 유저 정보가 필요하면 여기서 세팅
        // 예: User currentUser = SecurityUtil.getCurrentUser();
        // noteUpdateDTO.setUserId(currentUser.getId());  -> DTO에 userId 없으므로 생략

        noteUpdateDTO.setImages(images);

        noteService.putNote(noteUpdateDTO);

        return ResponseEntity.ok("수정 완료");
    }

    @DeleteMapping("/deleteNote/{noteId}")
    public void deleteNote(@PathVariable(name="noteId") Long noteId) {
        noteService.deleteNote(noteId);
    }

    @PostMapping("/writeNote")
    public ResponseEntity<String> writeNote(@ModelAttribute NoteDTO imageBoardDTO) {
        try {
            noteService.WriteNote(imageBoardDTO);
            return ResponseEntity.ok("파일 업로드 성공");
        } catch (Exception e) {
            log.error("파일 업로드 실패", e);
            return ResponseEntity.status(400).body("파일 업로드 실패");
        }
    }

    @GetMapping("/{noteId}/image")
    public ResponseEntity<List<String>> getFileUrl(@PathVariable Long noteId) {
        try {
            Note note = noteService.findByBoardId(noteId)
                    .orElseThrow(() -> new RuntimeException("게시물 없음"));
            return ResponseEntity.ok(note.getImage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/file")
    public ResponseEntity<String> deleteFile(@RequestParam String url) {
        try {
            s3Service.deleteFile(url);  // 네가 작성한 메서드 호출
            return ResponseEntity.ok("삭제 성공");
        } catch (Exception e) {
            log.error("파일 삭제 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 실패");
        }
    }


}