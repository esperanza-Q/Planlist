package org.example.planlist.controller;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.FriendDTO.response.FriendListResponseDTO;
//import org.example.planlist.dto.InvitePageResponseDTO;
import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectRequestDTO;
import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectResponseDTO;
import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.dto.PtDTO.response.InviteUserResponseDTO;
import org.example.planlist.entity.User;
import org.example.planlist.security.SecurityUtil;
import org.example.planlist.service.PlannerProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/planner")
public class PlannerProjectController {

    private final PlannerProjectService plannerProjectService;

    // 1. 프로젝트 생성
    @PostMapping("/create")
    public ResponseEntity<PlannerProjectResponseDTO> createPlannerProject(
            @RequestBody PlannerProjectRequestDTO dto,
            @RequestParam Long userId // 또는 JWT에서 추출
    ) {
        PlannerProjectResponseDTO response = plannerProjectService.createPlannerProject(dto, userId);
        return ResponseEntity.ok(response);
    }

    // 2. 친구 목록 & 참여자 목록 조회
    @GetMapping("/{projectId}/invitePage")
    public ResponseEntity<InviteUserResponseDTO> getInvitePageData(@PathVariable Long projectId) {
//        List<User> friends = plannerProjectService.getFriendList(userId);
//        List<ProjectParticipantRequestDTO> participants = plannerProjectService.getParticipantList(projectId);

//        FriendListResponseDTO friendListResponseDTO = new FriendListResponseDTO(friends, )


        InviteUserResponseDTO response = plannerProjectService.getInviteUsers(projectId);
        return ResponseEntity.ok(response);
    }

    // 2. 친구 목록 조회
    @GetMapping("/{projectId}/invite/friends")
    public ResponseEntity<List<User>> getFriendList(Long userId) {
        return ResponseEntity.ok(plannerProjectService.getFriendList(userId));
    }
//
//    // 2. 참여자 목록 조회
//    @GetMapping("/{projectId}/invite/participants")
//    public ResponseEntity<List<ProjectParticipantRequestDTO>> getParticipantList(@PathVariable Long projectId) {
//        return ResponseEntity.ok(plannerProjectService.getParticipantList(projectId));
//    }

    // 3. 친구 초대
    @PostMapping("/{projectId}/inviteFriend")
    public ResponseEntity<Void> inviteFriend(
            @RequestBody ProjectParticipantRequestDTO dto,
            @PathVariable Long projectId,
            @RequestParam Long friendId
    ) {
        dto.setProjectId(projectId); // projectId가 dto에 없을 수 있으니 명시적으로 set
        plannerProjectService.inviteFriend(dto, friendId);
        return ResponseEntity.ok().build();
    }

//    // 4. 친구 검색
//    @GetMapping("/{projectId}/invite/search")
//    public ResponseEntity<List<User>> searchFriends(
//            @RequestParam String keyword
//    ) {
//        User currentUser = SecurityUtil.getCurrentUser();
//        return ResponseEntity.ok(plannerProjectService.searchFriends(keyword));
//    }

    // 5. 참여자 삭제
    @DeleteMapping("/{projectId}/delete/participant")
    public ResponseEntity<Void> deleteParticipant(@RequestParam Long participantId) {
        plannerProjectService.deleteParticipant(participantId);
        return ResponseEntity.noContent().build();
    }

    // 7. 시작 날짜 설정
    @PostMapping("/{projectId}/start-date")
    public ResponseEntity<Void> setStartDate(
            @PathVariable Long projectId,
            @RequestParam String startDate // "yyyy-MM-dd" 형태로 넘어오도록
    ) {
        plannerProjectService.setStartDate(projectId, LocalDate.parse(startDate));
        return ResponseEntity.ok().build();
    }

    // 8. 끝 날짜 설정
    @PostMapping("/{projectId}/end-date")
    public ResponseEntity<Void> setEndDate(
            @PathVariable Long projectId,
            @RequestParam String endDate // "yyyy-MM-dd" 형태로 넘어오도록
    ) {
        plannerProjectService.setEndDate(projectId, LocalDate.parse(endDate));
        return ResponseEntity.ok().build();
    }

    // 9. 프로젝트 최종 확정
    @PostMapping("/{projectId}/finalize")
    public ResponseEntity<Void> finalizeProject(@PathVariable Long projectId) {
        plannerProjectService.finalizeProject(projectId);
        return ResponseEntity.ok().build();
    }
}