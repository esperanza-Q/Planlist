package org.example.planlist.controller.User;

import org.example.planlist.dto.DatePlannerDTO.DatePlannerResponseDTO;
import org.example.planlist.dto.WishlistDTO.WishlistResponseDTO;
import org.example.planlist.service.Travel.DatePlannerService;
import org.example.planlist.service.WishlistService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/planner/{projectId}/travel/map")
public class MapController {
    private final WishlistService wishlistService;
    private final DatePlannerService datePlannerService;

    public MapController(WishlistService wishlistService, DatePlannerService datePlannerService) {
        this.wishlistService = wishlistService;
        this.datePlannerService = datePlannerService;
    }

    // "전체"는 "all" 또는 "All"로 보내주시길 바랍니다!!
    // 사용자가 선택한 wishlist 카테고리 꼭 param으로 보내기
    @GetMapping("/wishlist")
    public ResponseEntity<List<WishlistResponseDTO>> getWishlistItems(
            @PathVariable Long projectId,
            @RequestParam String category) {
        return ResponseEntity.ok(wishlistService.getWishlistItems(projectId, category));
    }

    @GetMapping("/dateplanner")
    public ResponseEntity<List<DatePlannerResponseDTO>> getDatePlannerItems(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(datePlannerService.getDatePlannerItems(projectId, date));
    }
}
