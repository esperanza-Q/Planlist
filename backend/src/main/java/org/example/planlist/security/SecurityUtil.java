package org.example.planlist.security;

import org.example.planlist.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    // ✅ 현재 로그인된 유저의 ID 반환
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    // ✅ 현재 로그인된 유저 객체 반환
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("현재 로그인된 사용자가 없습니다.");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}
