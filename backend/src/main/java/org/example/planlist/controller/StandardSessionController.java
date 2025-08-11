package org.example.planlist.controller;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.StandardSessionDTO.StandardSessionRequestDTO;
import org.example.planlist.dto.StandardSessionDTO.StandardSessionResponseDTO;
import org.example.planlist.service.StandardSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/planner/{projectId}")
public class StandardSessionController {

    private final StandardSessionService standardSessionService;

    @PostMapping("/standard")
    public ResponseEntity<StandardSessionResponseDTO> createStandardSession(
            @RequestBody StandardSessionRequestDTO dto) {
        StandardSessionResponseDTO response = standardSessionService.createStandardSession(dto);
        return ResponseEntity.ok(response);
    }
}
