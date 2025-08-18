package org.example.planlist.controller.Standard;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.StandardDTO.response.StandardSessionResponseDTO;
import org.example.planlist.service.Standard.StandardSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/standard/session")
@RequiredArgsConstructor
public class StandardSessionController {

    private final StandardSessionService standardSessionService;

    @GetMapping("")
    public ResponseEntity<StandardSessionResponseDTO> getSession(@RequestParam Long sessionId) {
        return ResponseEntity.ok(standardSessionService.getStandardSession(sessionId));
    }
}
