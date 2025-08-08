package org.example.planlist.controller;

import org.example.planlist.dto.WishlistDTO.WishlistRequestDTO;
import org.example.planlist.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/planner/{projectId}/travel/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // 카테고리 선택, 경로에서 projectId 가져옴
    @PostMapping("")
    public ResponseEntity<String> addWishlistItem(@PathVariable Long projectId,
                                                  @RequestBody WishlistRequestDTO requestDTO) {
        wishlistService.addItem(projectId, requestDTO.getCategory(), requestDTO);
        return ResponseEntity.ok(" 카테고리에 항목이 추가되었습니다.");
    }

    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<String> deleteWishlistItem(@PathVariable Long wishlistId) {
        wishlistService.deleteItem(wishlistId);
        return ResponseEntity.ok("위시리스트 항목이 삭제되었습니다.");
    }

}
