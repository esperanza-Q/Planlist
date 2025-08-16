package org.example.planlist.controller.Sidebar;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.SidebarDTO.NextEventDTO;
import org.example.planlist.service.Sidebar.SidebarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sidebar")
@RequiredArgsConstructor
public class SidebarController {

    private final SidebarService sidebarService;

    @GetMapping("")
    public ResponseEntity<NextEventDTO> getNextEventToday() {
        return ResponseEntity.ok(sidebarService.getNextEventToday());
    }
}

