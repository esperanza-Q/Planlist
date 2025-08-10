package org.example.planlist.controller;

import org.example.planlist.dto.WishlistDTO.WishlistRequestDTO;
import org.example.planlist.dto.WishlistDTO.WishlistResponseDTO;
import org.example.planlist.entity.Wishlist;
import org.example.planlist.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planner/{projectId}/travel/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // 사용자가 카테고리 선택하면 url에 붙게 해주세요!!

    // url 경로에서 projectId 가져옴
    @PostMapping("/{category}")
    public ResponseEntity<String> addWishlistItem(@PathVariable Long projectId,
                                                  @PathVariable String category,
                                                  @RequestBody WishlistRequestDTO requestDTO) {
        wishlistService.addItem(projectId, category, requestDTO);
        return ResponseEntity.ok(" 카테고리에 항목이 추가되었습니다.");
    }

    @GetMapping("/{category}")
    public ResponseEntity<List<WishlistResponseDTO>> getWishlistByCategory(
            @PathVariable Long projectId,
            @PathVariable String category
    ) {
        List<WishlistResponseDTO> items = wishlistService.getItems(projectId, category);
        return ResponseEntity.ok(items);
    }


    @DeleteMapping("/{category}/{wishlistId}")    public ResponseEntity<String> deleteWishlistItem(@PathVariable Long wishlistId) {
        wishlistService.deleteItem(wishlistId);
        return ResponseEntity.ok("위시리스트 항목이 삭제되었습니다.");
    }

}
