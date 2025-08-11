package org.example.planlist.controller.Pt;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PT.request.PtProjectCreateRequestDTO;
import org.example.planlist.dto.PT.response.InviteUserResponseDTO;
import org.example.planlist.dto.PT.response.PtProjectCreateResponseDTO;
import org.example.planlist.security.CustomUserDetails;
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

    @PostMapping("/createProject")
    public ResponseEntity<PtProjectCreateResponseDTO> createProject(
            @RequestBody PtProjectCreateRequestDTO request) {

        PtProjectCreateResponseDTO response = ptService.createProject(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/inviteUser/{projectId}")
    public ResponseEntity<InviteUserResponseDTO> inviteUser(
            @PathVariable Long projectId) {

        InviteUserResponseDTO response = ptService.getInviteUsers(projectId);

        return ResponseEntity.ok(response);
    }
}

