package org.example.planlist.controller.Meeting;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MeetingDTO.request.MeetingProjectCreateRequestDTO;
import org.example.planlist.dto.MeetingDTO.request.MeetingProjectInviteRequestDTO;
import org.example.planlist.dto.MeetingDTO.response.MeetingProjectCreateResponseDTO;
import org.example.planlist.dto.MeetingDTO.response.MeetingProjectDetailResponseDTO;
import org.example.planlist.dto.MeetingDTO.request.AddSessionRequestDTO;
import org.example.planlist.dto.SharePlannerDTO.request.SelectTimeRequestDTO;
import org.example.planlist.dto.MeetingDTO.response.*;
import org.example.planlist.dto.SharePlannerDTO.response.MeetingSharedPlannerResponseDTO;
import org.example.planlist.dto.SharePlannerDTO.response.SharedPlannerResponseDTO;
import org.example.planlist.entity.PlannerSession;
import org.example.planlist.repository.PlannerSessionRepository;
import org.example.planlist.service.Meeting.MeetingProjectService;
import org.example.planlist.service.Meeting.MeetingService;
import org.example.planlist.service.MeetingSharePlanner.MeetingSharePlannerService;
import org.example.planlist.service.SharePlanner.SharePlannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meeting")
public class MeetingController {

    private final MeetingService meetingService;
    private final MeetingProjectService meetingProjectService;
    private final MeetingSharePlannerService meetingSharePlannerService;
    private final PlannerSessionRepository plannerSessionRepository;

    @PostMapping("/createProject")
    public ResponseEntity<MeetingProjectCreateResponseDTO> createProject(
            @RequestBody MeetingProjectCreateRequestDTO request) {

        MeetingProjectCreateResponseDTO response = meetingService.createProject(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/inviteUser/{projectId}")
    public ResponseEntity<InviteUserResponseDTO> inviteUserPage(
            @PathVariable Long projectId) {

        InviteUserResponseDTO response = meetingService.getInviteUsers(projectId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/inviteUser/{projectId}/invite")
    public ResponseEntity<String> inviteUser(
            @PathVariable Long projectId,
            @RequestBody MeetingProjectInviteRequestDTO request) {

        meetingService.sendMeetingInvite(projectId, request);

        return ResponseEntity.ok("프로젝트 요청 성공!");
    }

    @DeleteMapping("/inviteUser/{projectId}/deleteRequest/{participantId}")
    public ResponseEntity<String> acceptInvite(
            @PathVariable Long projectId,
            @PathVariable Long participantId
    ){

        meetingService.deleteMeetingInvite(projectId, participantId);

        return ResponseEntity.ok("프로젝트 요청 삭제 성공!");

    }


    @GetMapping("/project/{projectId}")
    public ResponseEntity<MeetingProjectDetailResponseDTO> getMeetingProjectDetail(
        @PathVariable 
        @RequestParam Long projectId) {
        return ResponseEntity.ok(meetingProjectService.getMeetingProjectDetail(projectId));
    }

    @GetMapping("/inviteUser/{projectId}/inprogress")
    public ResponseEntity<String> projectConfirm(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(meetingService.projectConfirm(projectId));
    }

    @GetMapping("/inviteUser/{projectId}/finished")
    public ResponseEntity<String> projectFinished(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(meetingService.projectFinished(projectId));
    }

    @PostMapping("/project/addSession")
    public ResponseEntity<AddSessionResponseDTO> addMeetingSession(
            @RequestBody AddSessionRequestDTO addSessionRequestDTO) {

        AddSessionResponseDTO dto = meetingService.addMeetingSession(addSessionRequestDTO);

        return ResponseEntity.ok(dto);
    }



    @GetMapping("/project/sharePlanner")
    public ResponseEntity<MeetingSharedPlannerResponseDTO> getSharedPlanner(
            @RequestParam Long plannerId
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {

        MeetingSharedPlannerResponseDTO response = meetingSharePlannerService.getSharedPlanner(plannerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/project/selectTime")
    public ResponseEntity<String> selectTime(
            @RequestParam Long plannerId,
            @RequestBody SelectTimeRequestDTO dto) {

        PlannerSession updated = meetingSharePlannerService.updateSelectTime(plannerId, dto);
        return ResponseEntity.ok("일정을 선택 완료하였습니다!");
    }


}