package org.example.planlist.controller;

import org.example.planlist.dto.DatePlannerDTO.DatePlannerRequestDTO;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerResponseDTO;
import org.example.planlist.entity.Wishlist;
import org.example.planlist.repository.WishlistRepository;
import org.example.planlist.service.DatePlannerService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/planner/{projectId}/travel/dateplanner")
public class DatePlannerController {
    private final DatePlannerService datePlannerService;
    private final WishlistRepository wishlistRepository;

    public DatePlannerController(DatePlannerService datePlannerService, WishlistRepository wishlistRepository) {
        this.datePlannerService = datePlannerService;
        this.wishlistRepository = wishlistRepository;
    }

    @GetMapping("/wishlist/{category}")
    public ResponseEntity<List<DatePlannerResponseDTO>> getWishlistItems(
            @PathVariable Long projectId,
            @PathVariable String category) {

        // String → Enum 변환 (대소문자 무시)
        Wishlist.Category categoryEnum = Arrays.stream(Wishlist.Category.values())
                .filter(c -> c.name().equalsIgnoreCase(category))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값: " + category));

        // Entity → DTO 변환
        List<DatePlannerResponseDTO> items = wishlistRepository
                .findByProject_ProjectIdAndCategory(projectId, categoryEnum)
                .stream()
                .map(w -> DatePlannerResponseDTO.builder()
                        .wishlistId(w.getWishlistId())
                        .wishlistName(w.getName())
                        .category(w.getCategory().name())
                        .address(w.getAddress())
                        .latitude(w.getLatitude())
                        .longitude(w.getLongitude())
                        .memo(w.getMemo())
                        .cost(w.getCost())
                        .createdAt(w.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(items);
    }

    @PostMapping("")
    public ResponseEntity<String> addDatePlannerItem(@PathVariable Long projectId,
                                                     @PathVariable String category,
                                                     @RequestBody DatePlannerRequestDTO requestDTO) {
        datePlannerService.addItem(projectId, category, requestDTO);
        return ResponseEntity.ok("해당 날짜의 플래너에 항목이 추가되었습니다.");
    }

    // 사용자가 선택한 날짜를 기반으로 조회할 수 있게끔 선택한 날짜를 url에 붙입니다.
    @GetMapping("/{date}")
    public ResponseEntity<List<DatePlannerResponseDTO>> getDatePlannerItems(
            @PathVariable Long projectId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<DatePlannerResponseDTO> items = datePlannerService.getDatePlannerItems(projectId, date);
        return ResponseEntity.ok(items);
    }

    // DatePlanner 페이지 안에서
    @DeleteMapping("/{datePlannerId}")
    public ResponseEntity<String> deleteDatePlannerItem(@PathVariable Long datePlannerId) {
        datePlannerService.deleteItem(datePlannerId);
        return ResponseEntity.ok("해당 날짜의 항목이 삭제되었습니다.");
    }
}

