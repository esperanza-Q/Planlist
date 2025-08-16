package org.example.planlist.controller.Travel;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.SharePlannerDTO.request.SelectTimeRequestDTO;
import org.example.planlist.dto.SharePlannerDTO.response.SharedPlannerResponseDTO;
import org.example.planlist.dto.TravelDTO.Request.TravelCreateRequestDTO;
import org.example.planlist.dto.TravelDTO.Request.TravelProjectInviteRequestDTO;
import org.example.planlist.dto.TravelDTO.Response.InviteUserResponseDTO;
import org.example.planlist.dto.TravelDTO.Response.TravelCreateResponseDTO;
import org.example.planlist.dto.TravelDTO.Response.TravelInviteeFreeTimeResponseDTO;
import org.example.planlist.dto.TravelDTO.Response.TravelProjectDetailResponseDTO;
import org.example.planlist.entity.PlannerSession;
import org.example.planlist.service.Travel.TravelService;
import org.example.planlist.service.Travel.TravelProjectService;
import org.example.planlist.service.SharePlanner.SharePlannerService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000",
allowCredentials = "true",
  allowedHeaders = {"Content-Type", "Authorization"},
  methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
  )
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/travel")
public class TravelController {

    private final TravelService travelService;
    private final TravelProjectService travelProjectService;
    private final SharePlannerService sharePlannerService;

    @PostMapping("/createProject")
    public ResponseEntity<TravelCreateResponseDTO> createProject(
            @RequestBody TravelCreateRequestDTO request) {

        TravelCreateResponseDTO response = travelService.createProject(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/inviteUser/{projectId}")
    public ResponseEntity<InviteUserResponseDTO> inviteUserPage(
            @PathVariable Long projectId) {

        InviteUserResponseDTO response = travelService.getInviteUsers(projectId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/inviteUser/{projectId}/invite")
    public ResponseEntity<String> inviteUser(
            @PathVariable Long projectId,
            @RequestBody TravelProjectInviteRequestDTO request) {

        travelService.sendTravelInvite(projectId, request);

        return ResponseEntity.ok("프로젝트 요청 성공!");
    }

    @PostMapping("/inviteUser/{projectId}/accept")
    public ResponseEntity<String> acceptInvite(
            @PathVariable Long projectId) {

        travelService.acceptTravelInvite(projectId);
        return ResponseEntity.ok("초대를 수락했습니다.");
    }

    @DeleteMapping("/inviteUser/{projectId}/deleteRequest/{participantId}")
    public ResponseEntity<String> acceptInvite(
            @PathVariable Long projectId,
            @PathVariable Long participantId
    ){

        travelService.deleteTravelInvite(projectId, participantId);

        return ResponseEntity.ok("프로젝트 요청 삭제 성공!");

    }

    @GetMapping("/inviteUser/{projectId}/inprogress")
    public ResponseEntity<String> projectConfirm(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(travelService.projectConfirm(projectId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<TravelProjectDetailResponseDTO> getTravelProjectDetail(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(travelProjectService.getTravelProjectDetail(projectId));
    }

    // 여행 프로젝트 공유 캘린더 조회(all_day 가능 날짜만 반환)
    @GetMapping("/project/{projectId}/travelSharedCalendar")
    public ResponseEntity<List<TravelInviteeFreeTimeResponseDTO>> getTravelSharedCalendar(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<TravelInviteeFreeTimeResponseDTO> response =
                travelService.getTravelSharedCalendar(projectId, startDate, endDate);
        return ResponseEntity.ok(response);
    }


    // 여행 프로젝트 확정 날짜 선택 (여러 날짜 연속 가능)
    @PostMapping("/project/{projectId}/travelSelectDate")
    public ResponseEntity<String> confirmTravelDate(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        travelService.confirmTravelDateRange(projectId, startDate, endDate);
        return ResponseEntity.ok("여행 날짜가 확정되었습니다!");
    }


}

