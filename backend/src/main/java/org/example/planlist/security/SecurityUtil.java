package org.example.planlist.security;

import org.example.planlist.entity.User;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.util.SpringContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

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

//        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
//        return userDetails.getUser();

        Object principal = authentication.getPrincipal();
        User user = null;


        if (principal instanceof CustomUserDetails) { // !수정! 일반 로그인
            user = ((CustomUserDetails) principal).getUser();
        } else if (principal instanceof CustomOAuth2User) { // !추가! OAuth2 로그인
            user = ((CustomOAuth2User) principal).getUser();
        } else if (principal instanceof DefaultOAuth2User) { // !추가! fallback
            String email = ((DefaultOAuth2User) principal).getAttribute("email");
            UserRepository userRepository = SpringContext.getBean(UserRepository.class); // !추가! static context에서 repository 가져오기
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        } else {
            throw new RuntimeException("Unsupported principal type: " + principal.getClass().getName());
        }

        return user;
    }
}
