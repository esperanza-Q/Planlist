package org.example.planlist.controller;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MeetingSessionDTO.MeetingSessionRequestDTO;
import org.example.planlist.dto.MeetingSessionDTO.MeetingSessionResponseDTO;
import org.example.planlist.service.MeetingSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/planner/{projectId}")
public class MeetingSessionController {

    private final MeetingSessionService meetingSessionService;

    @PostMapping("/meeting")
    public ResponseEntity<MeetingSessionResponseDTO> createMeetingSession(
            @RequestBody MeetingSessionRequestDTO dto) {
        MeetingSessionResponseDTO response = meetingSessionService.createMeetingSession(dto);
        return ResponseEntity.ok(response);
    }
}
