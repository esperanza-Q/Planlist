package org.example.planlist.controller.Note;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.NoteDTO.NoteDTO;
import org.example.planlist.entity.Note;
import org.example.planlist.service.Note.NoteService;
import org.example.planlist.service.S3Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/getNote")
    public Optional<Note> getBoard(@RequestParam(name = "boardId") Long boardId) {
        return noteService.findByBoardId(boardId);
    }

//    @PostMapping("/writeNote")
//    public void writeNote(@RequestParam(name = "projectId") Long projectId, @RequestBody NoteDTO noteDTO) throws IOException {
//
//        noteService.WriteNote(noteDTO);
//    }

    @PostMapping("/updateNote")
    public void updateNote(@RequestBody NoteDTO noteDTO){
        noteService.putNote(noteDTO);
    }

    @DeleteMapping("/deleteNote{noteId}")
    public void deleteBoard(@PathVariable(name="noteId") Long noteId) {
        noteService.deleteBoard(noteId);
    }

    @PostMapping("/WriteNote")
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