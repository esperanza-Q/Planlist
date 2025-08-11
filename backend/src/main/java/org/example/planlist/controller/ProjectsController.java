package org.example.planlist.controller;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectResponseDTO;
import org.example.planlist.service.PlannerProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectsController {

    private final PlannerProjectService plannerProjectService;

    @GetMapping
    public ResponseEntity<List<PlannerProjectResponseDTO>> getMyProjects() {
        return ResponseEntity.ok(plannerProjectService.getMyProjects());
    }
}