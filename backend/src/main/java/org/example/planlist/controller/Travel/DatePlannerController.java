package org.example.planlist.controller.Travel;

import org.example.planlist.dto.DatePlannerDTO.DatePlannerRequestDTO;
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
@RequestMapping("/api/travel/{projectId}/dateplanner")
public class DatePlannerController {
    private final DatePlannerService datePlannerService;
    private final WishlistService wishlistService;

    public DatePlannerController(DatePlannerService datePlannerService, WishlistService wishlistService) {
        this.datePlannerService = datePlannerService;
        this.wishlistService = wishlistService;
    }

    // 날짜별로 플래너 항목 추가
    @PostMapping("/{category}")
    public ResponseEntity<String> addDatePlannerItem(@PathVariable Long projectId,
                                                     @PathVariable String category,
                                                     @RequestBody DatePlannerRequestDTO requestDTO) {
        datePlannerService.addDatePlannerItem(projectId, category, requestDTO);
        return ResponseEntity.ok("해당 날짜의 플래너에 항목이 추가되었습니다.");
    }

    // add place -> 팝업창으로 wishlist 카테고리별 내역 조회
    @GetMapping("wishlist/{category}")
    public ResponseEntity<List<WishlistResponseDTO>> getWishlistItems(
            @PathVariable Long projectId,
            @PathVariable String category) {
        List<WishlistResponseDTO> items = wishlistService.getWishlistItems(projectId, category);
        return ResponseEntity.ok(items);
    }

    // 날짜별로 플래너 항목 조회
    @GetMapping("/{date}")
    public ResponseEntity<List<DatePlannerResponseDTO>> getDatePlannerItems(
            @PathVariable Long projectId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DatePlannerResponseDTO> items = datePlannerService.getDatePlannerItems(projectId, date);
        return ResponseEntity.ok(items);
    }

    // DatePlanner 페이지 안에서 생성된 DatePlanner 개별 항목 ID를 기반으로 삭제
    @DeleteMapping("/{datePlannerId}")
    public ResponseEntity<String> deleteDatePlannerItem(@PathVariable Long datePlannerId) {
        datePlannerService.deleteItem(datePlannerId);
        return ResponseEntity.ok("해당 날짜의 항목이 삭제되었습니다.");
    }
}

