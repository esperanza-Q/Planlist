package org.example.planlist.security;

import org.example.planlist.entity.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;


public class CustomOAuth2User extends CustomUserDetails implements OAuth2User { // !수정! CustomUserDetails 상속 + OAuth2User 구현

    private final Map<String, Object> attributes; // !추가! OAuth2User 속성 저장

    public CustomOAuth2User(User user, Map<String, Object> attributes) { // !추가!
        super(user); // !수정! CustomUserDetails 생성자 호출
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() { // !추가!
        return attributes;
    }

    @Override
    public String getName() { // !추가!
        return getUser().getName();
    }
}