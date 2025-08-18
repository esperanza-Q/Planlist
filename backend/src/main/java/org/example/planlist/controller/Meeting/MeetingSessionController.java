package org.example.planlist.controller.Meeting;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MeetingDTO.response.MeetingSessionResponseDTO;
import org.example.planlist.service.Meeting.MeetingSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meeting/session")
@RequiredArgsConstructor
public class MeetingSessionController {

    private final MeetingSessionService meetingSessionService;

    @GetMapping("")
    public ResponseEntity<MeetingSessionResponseDTO> getSession(@RequestParam Long sessionId) {
        return ResponseEntity.ok(meetingSessionService.getMeetingSession(sessionId));
    }
}
