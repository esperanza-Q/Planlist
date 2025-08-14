package org.example.planlist.controller.Pt;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PtDTO.request.PtProjectCreateRequestDTO;
import org.example.planlist.dto.PtDTO.request.PtProjectInviteRequestDTO;
import org.example.planlist.dto.PtDTO.request.AddSessionRequestDTO;
import org.example.planlist.dto.SharePlannerDTO.request.SelectTimeRequestDTO;
import org.example.planlist.dto.PtDTO.response.*;
import org.example.planlist.dto.SharePlannerDTO.response.SharedPlannerResponseDTO;
import org.example.planlist.entity.PlannerSession;
import org.example.planlist.repository.PlannerSessionRepository;
import org.example.planlist.service.PT.PtProjectService;
import org.example.planlist.service.PT.PtService;
import org.example.planlist.service.SharePlanner.SharePlannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pt")
public class PtController {

    private final PtService ptService;
    private final PtProjectService ptProjectService;
    private final SharePlannerService sharePlannerService;
    private final PlannerSessionRepository plannerSessionRepository;

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

    @DeleteMapping("/inviteUser/{projectId}/deleteRequest/{userId}")
    public ResponseEntity<String> deleteInvite(
            @PathVariable Long projectId,
            @PathVariable Long userId
    ){

        ptService.deletePtInvite(projectId, userId);

        return ResponseEntity.ok("프로젝트 요청 삭제 성공!");

    }


    @GetMapping("/project")
    public ResponseEntity<PtProjectDetailResponseDTO> getPtProjectDetail(
            @RequestParam Long projectId) {
        return ResponseEntity.ok(ptProjectService.getPtProjectDetail(projectId));
    }

    @GetMapping("/inviteUser/{projectId}/inprogress")
    public ResponseEntity<String> projectConfirm(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(ptService.projectConfirm(projectId));
    }

    @PostMapping("/project/addSession")
    public ResponseEntity<AddSessionResponseDTO> addPtSession(
            @RequestBody AddSessionRequestDTO addSessionRequestDTO) {

        AddSessionResponseDTO dto = ptService.addPtSession(addSessionRequestDTO);

        return ResponseEntity.ok(dto);
    }



    @GetMapping("/project/sharePlanner")
    public ResponseEntity<SharedPlannerResponseDTO> getSharedPlanner(
            @RequestParam Long plannerId
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
            ) {

        SharedPlannerResponseDTO response = sharePlannerService.getSharedPlanner(plannerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/project/selectTime")
    public ResponseEntity<String> selectTime(
            @RequestParam Long plannerId,
            @RequestBody SelectTimeRequestDTO dto) {

        PlannerSession updated = sharePlannerService.updateSelectTime(plannerId, dto);
        return ResponseEntity.ok("일정을 선택 완료하였습니다!");
    }


}

