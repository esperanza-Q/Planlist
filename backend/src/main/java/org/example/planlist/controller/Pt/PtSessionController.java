package org.example.planlist.controller.Pt;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PT.request.PtCommentRequestDTO;
import org.example.planlist.dto.PT.request.TodayGoalRequestDTO;
import org.example.planlist.dto.PT.response.PtSessionResponseDTO;
import org.example.planlist.entity.PtSession;
import org.example.planlist.service.PT.PtSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pt/session")
@RequiredArgsConstructor
public class PtSessionController {

    private final PtSessionService ptSessionService;

    @GetMapping("")
    public ResponseEntity<PtSessionResponseDTO> getSession(@RequestParam Long sessionId) {
        return ResponseEntity.ok(ptSessionService.getPtSession(sessionId));
    }

    @PostMapping("/writeComment")
    public ResponseEntity<String> writeComment(@RequestParam Long sessionId,
                                               @RequestBody PtCommentRequestDTO ptCommentRequestDTO) {
        return ResponseEntity.ok(ptSessionService.writeComment(sessionId, ptCommentRequestDTO));
    }

    @DeleteMapping("/deleteComment")
    public ResponseEntity<String> deleteComment(@RequestParam Long commentId){
        return ResponseEntity.ok(ptSessionService.deleteComment(commentId));
    }

    @PutMapping("/todayGoal")
    public ResponseEntity<PtSession> todayGoal(@RequestParam Long sessionId,
                                               @RequestBody TodayGoalRequestDTO todayGoalRequestDTO){
        return ResponseEntity.ok(ptSessionService.todayGoal(sessionId, todayGoalRequestDTO));
    }

}

