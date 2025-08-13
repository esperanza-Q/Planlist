package org.example.planlist.controller.Standard;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.SharePlannerDTO.response.SharedPlannerResponseDTO;
import org.example.planlist.dto.StandardDTO.request.AddSessionRequestDTO;
import org.example.planlist.dto.StandardDTO.request.StandardProjectCreateRequestDTO;
import org.example.planlist.dto.StandardDTO.request.StandardProjectInviteRequestDTO;
import org.example.planlist.dto.SharePlannerDTO.request.SelectTimeRequestDTO;
import org.example.planlist.dto.StandardDTO.response.*;
import org.example.planlist.dto.StandardDTO.response.StandardProjectCreateResponseDTO;
import org.example.planlist.dto.StandardDTO.response.StandardProjectDetailResponseDTO;
import org.example.planlist.entity.PlannerSession;
import org.example.planlist.repository.PlannerSessionRepository;
import org.example.planlist.service.Standard.StandardProjectService;
import org.example.planlist.service.Standard.StandardService;
import org.example.planlist.service.SharePlanner.SharePlannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/standard")
public class StandardController {

    private final StandardService standardService;
    private final StandardProjectService standardProjectService;
    private final SharePlannerService sharePlannerService;
    private final PlannerSessionRepository plannerSessionRepository;

    @PostMapping("/createProject")
    public ResponseEntity<StandardProjectCreateResponseDTO> createProject(
            @RequestBody StandardProjectCreateRequestDTO request) {

        StandardProjectCreateResponseDTO response = standardService.createProject(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/inviteUser/{projectId}")
    public ResponseEntity<InviteUserResponseDTO> inviteUserPage(
            @PathVariable Long projectId) {

        InviteUserResponseDTO response = standardService.getInviteUsers(projectId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/inviteUser/{projectId}/invite")
    public ResponseEntity<String> inviteUser(
            @PathVariable Long projectId,
            @RequestBody StandardProjectInviteRequestDTO request) {

        standardService.sendStandardInvite(projectId, request);

        return ResponseEntity.ok("프로젝트 요청 성공!");
    }

    @DeleteMapping("/inviteUser/{projectId}/deleteRequest/{participantId}")
    public ResponseEntity<String> acceptInvite(
            @PathVariable Long projectId,
            @PathVariable Long participantId
    ){

        standardService.deleteStandardInvite(projectId, participantId);

        return ResponseEntity.ok("프로젝트 요청 삭제 성공!");

    }


    @GetMapping("/project")
    public ResponseEntity<StandardProjectDetailResponseDTO> getStandardProjectDetail(
            @RequestParam Long projectId) {
        return ResponseEntity.ok(standardProjectService.getStandardProjectDetail(projectId));
    }

    @GetMapping("/inviteUser/{projectId}/inprogress")
    public ResponseEntity<String> projectConfirm(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(standardService.projectConfirm(projectId));
    }

    @PostMapping("/project/addSession")
    public ResponseEntity<AddSessionResponseDTO> addStandardSession(
            @RequestBody AddSessionRequestDTO addSessionRequestDTO) {

        AddSessionResponseDTO dto = standardService.addStandardSession(addSessionRequestDTO);

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