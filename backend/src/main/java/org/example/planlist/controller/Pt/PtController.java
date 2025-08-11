package org.example.planlist.controller.Pt;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PT.request.PtProjectCreateRequestDTO;
import org.example.planlist.dto.PT.request.PtProjectInviteRequestDTO;
import org.example.planlist.dto.PT.response.InviteUserResponseDTO;
import org.example.planlist.dto.PT.response.PtProjectCreateResponseDTO;
import org.example.planlist.dto.PT.response.PtProjectDetailResponseDTO;
import org.example.planlist.security.CustomUserDetails;
import org.example.planlist.service.PT.PtProjectService;
import org.example.planlist.service.PT.PtService;
import org.example.planlist.service.PlanlistCalendar.PlanlistCalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pt")
public class PtController {

    private final PtService ptService;
    private final PtProjectService ptProjectService;

    @PostMapping("/createProject")
    public ResponseEntity<PtProjectCreateResponseDTO> createProject(
            @RequestBody PtProjectCreateRequestDTO request) {

        PtProjectCreateResponseDTO response = ptService.createProject(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/inviteUser/{projectId}")
    public ResponseEntity<InviteUserResponseDTO> inviteUserPage(
            @PathVariable Long projectId) {

        InviteUserResponseDTO response = ptService.getInviteUsers(projectId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/inviteUser/{projectId}/invite")
    public ResponseEntity<String> inviteUser(
            @PathVariable Long projectId,
            @RequestBody PtProjectInviteRequestDTO request) {

        ptService.sendPtInvite(projectId, request);

        return ResponseEntity.ok("프로젝트 요청 성공!");
    }

    @DeleteMapping("/inviteUser/{projectId}/deleteRequest/{participantId}")
    public ResponseEntity<String> acceptInvite(
            @PathVariable Long projectId,
            @PathVariable Long participantId
    ){

        ptService.deletePtInvite(projectId, participantId);

        return ResponseEntity.ok("프로젝트 요청 삭제 성공!");

    }


    @GetMapping("/project")
    public ResponseEntity<PtProjectDetailResponseDTO> getPtProjectDetail(
            @RequestParam Long projectId) {
        return ResponseEntity.ok(ptProjectService.getPtProjectDetail(projectId));
    }


}

