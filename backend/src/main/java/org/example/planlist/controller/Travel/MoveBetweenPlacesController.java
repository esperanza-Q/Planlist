package org.example.planlist.controller.Travel;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesRequestDTO;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesResponseDTO;
import org.example.planlist.service.MoveBetweenPlacesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/travel/{projectId}/dateplanner")
@RequiredArgsConstructor
public class MoveBetweenPlacesController {

    private final MoveBetweenPlacesService moveBetweenPlacesService;

    // 이동수단 추가
    @PostMapping("/{datePlannerId}/transport")
    public ResponseEntity<Void> addTransportation(
            @PathVariable Long projectId,
            @PathVariable Long datePlannerId,
            @RequestBody @Valid MoveBetweenPlacesRequestDTO dto) {

        moveBetweenPlacesService.addTransportation(projectId, datePlannerId, dto);
        return ResponseEntity.ok().build();
    }

    // 날짜별 플래너 기준 이동수단 조회
    @GetMapping("/{datePlannerId}/transport")
    public ResponseEntity<List<MoveBetweenPlacesResponseDTO>> getTransportationsByDatePlanner(
            @PathVariable Long projectId,
            @PathVariable Long datePlannerId) {

        return ResponseEntity.ok(moveBetweenPlacesService.getTransportationsByDatePlanner(datePlannerId));
    }

    // 프로젝트 전체 이동수단 조회
    @GetMapping("/transport")
    public ResponseEntity<List<MoveBetweenPlacesResponseDTO>> getTransportationsByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(moveBetweenPlacesService.getTransportationsByProject(projectId));
    }

    @DeleteMapping("/transport/{moveId}")
    public ResponseEntity<Void> deleteTransportation(@PathVariable Long moveId) {
        moveBetweenPlacesService.deleteTransportation(moveId);
        return ResponseEntity.noContent().build();
    }

}
