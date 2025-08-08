package org.example.planlist.repository;

import org.example.planlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    // 프로젝트 + 카테고리 + 이름 중복 체크
    boolean existsByProject_ProjectIdAndCategoryAndName(Long projectId,
                                                 Wishlist.Category category,
                                                 String name);
}
