/*
package org.example.planlist.controller.GoogleAPI;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.GoogleSocialDTO.request.GoogleTokenRequestDTO;
import org.example.planlist.dto.GoogleSocialDTO.response.JwtResponseDTO;
import org.example.planlist.entity.User;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.security.JwtTokenProvider;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    // 구글 API로 액세스 토큰 검증 및 사용자 정보 조회
    private static final String GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

    @PostMapping("/token")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody GoogleTokenRequestDTO request) {

        String accessToken = request.getAccessToken();

        // 1. 구글에 토큰으로 사용자 정보 요청
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                GOOGLE_USERINFO_ENDPOINT,
                HttpMethod.GET,
                entity,
                Map.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google access token");
        }

        Map userInfo = response.getBody();
        String email = (String) userInfo.get("email");
        Boolean emailVerified = Boolean.valueOf(String.valueOf(userInfo.get("email_verified")));

        if (email == null || !emailVerified) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email not verified by Google");
        }

        // 2. 내부 DB에서 사용자 찾기 또는 신규 생성
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setProvider("google");
//                    newUser.setCreatedAt(LocalDateTime.now());
                    // 필요시 기본 권한 설정 등
                    return userRepository.save(newUser);
                });

        // 3. JWT 토큰 생성
        String jwtToken = jwtTokenProvider.createToken(email);

        // 4. JWT 토큰 응답
        return ResponseEntity.ok(new JwtResponseDTO(jwtToken));
    }
}
*/
