package org.example.planlist.controller.Pt;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PtDTO.request.ExercisePlanRequestDTO;
import org.example.planlist.dto.PtDTO.request.PtCommentRequestDTO;
import org.example.planlist.dto.PtDTO.request.TodayGoalRequestDTO;
import org.example.planlist.dto.PtDTO.response.PtSessionResponseDTO;
import org.example.planlist.entity.ExercisePlan;
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

    @PostMapping("/addExercise")
    public ResponseEntity<?> addExercisePlan(
            @RequestParam Long sessionId,
            @RequestParam ExercisePlan.TYPE type,
            @RequestBody ExercisePlanRequestDTO requestDTO) {

        ExercisePlan savedPlan = ptSessionService.addExercisePlan(sessionId, type, requestDTO);
        return ResponseEntity.ok(savedPlan);
    }

    @DeleteMapping("/deleteExercise/{exercisePlanId}")
    public ResponseEntity<?> deleteExercisePlan(
            @PathVariable Long exercisePlanId) {

        String plan = ptSessionService.deleteExercisePlan(exercisePlanId);
        return ResponseEntity.ok(plan);
    }

}

