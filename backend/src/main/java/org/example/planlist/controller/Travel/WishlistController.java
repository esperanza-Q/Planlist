package org.example.planlist.controller.Travel;

import jakarta.validation.Valid;
import org.example.planlist.dto.WishlistDTO.WishlistRequestDTO;
import org.example.planlist.dto.WishlistDTO.WishlistResponseDTO;
import org.example.planlist.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/travel/{projectId}/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    /** 카테고리별 wishlist 항목 추가 (URL: /api/travel/{projectId}/wishlist/{category}) */
    @PostMapping("/{category}")
    public ResponseEntity<WishlistResponseDTO> addWishlistItem(@PathVariable Long projectId,
                                                               @PathVariable String category,
                                                               @Valid @RequestBody WishlistRequestDTO requestDTO) {
        WishlistResponseDTO created = wishlistService.addItem(projectId, category, requestDTO);

        // Location 헤더(선택): /api/travel/{projectId}/wishlist/{category}/{wishlistId}
        URI location = URI.create(String.format("/api/travel/%d/wishlist/%s/%d",
                projectId, category, created.getWishlistId()));

        return ResponseEntity.created(location).body(created);
    }

    /** 카테고리별 목록 조회 (ALL 지원) */
    @GetMapping("/{category}")
    public ResponseEntity<List<WishlistResponseDTO>> getWishlistByCategory(
            @PathVariable Long projectId,
            @PathVariable String category
    ) {
        List<WishlistResponseDTO> items = wishlistService.getWishlistItems(projectId, category);
        return ResponseEntity.ok(items);
    }

    /** 항목 삭제(권한 체크 포함) */
    @DeleteMapping("/{category}/{wishlistId}")
    public ResponseEntity<String> deleteWishlistItem(@PathVariable Long projectId,
                                                     @PathVariable String category, // 경로 일관성 유지용
                                                     @PathVariable Long wishlistId) {
        wishlistService.deleteItem(wishlistId);
        return ResponseEntity.ok("위시리스트 항목이 삭제되었습니다.");
    }
}
