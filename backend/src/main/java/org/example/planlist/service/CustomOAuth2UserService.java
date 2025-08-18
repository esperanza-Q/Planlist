package org.example.planlist.service;

import org.example.planlist.entity.ProjectCount;
import org.example.planlist.entity.User;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.security.CustomOAuth2User;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    public CustomOAuth2UserService(UserRepository userRepository,
                                   S3Service s3Service,
                                   OAuth2AuthorizedClientService authorizedClientService) {
        this.userRepository = userRepository;
        this.s3Service = s3Service;
        this.authorizedClientService = authorizedClientService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 기본 사용자 정보 로드
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String pictureUrl = oauth2User.getAttribute("picture");

        // principalName은 oauth2User에서 가져오기
        String principalName = oauth2User.getName();

        // authorizedClientService에서 토큰 가져오기
        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                registrationId,
                principalName
        );

        final String accessToken = (authorizedClient != null && authorizedClient.getAccessToken() != null)
                ? authorizedClient.getAccessToken().getTokenValue()
                : userRequest.getAccessToken().getTokenValue();

        final String refreshToken = (authorizedClient != null && authorizedClient.getRefreshToken() != null)
                ? authorizedClient.getRefreshToken().getTokenValue()
                : null;

        // 프로필 이미지 S3 업로드 시도
        String finalProfileImage = null;
        if (pictureUrl != null && !pictureUrl.isBlank()) {
            try {
                finalProfileImage = uploadImageFromUrlToS3(pictureUrl, email);
            } catch (Exception e) {
                e.printStackTrace();
                finalProfileImage = pictureUrl;
            }
        }
        String profileImageToUse = finalProfileImage != null ? finalProfileImage : pictureUrl;

        // DB에 유저 저장/갱신
//        User user = userRepository.findByEmail(email)
//                .map(u -> {
//                    u.setName(name);
//                    if (accessToken != null) {
//                        u.setGoogleAccessToken(accessToken);
//                    }
//                    if (refreshToken != null) {
//                        u.setGoogleRefreshToken(refreshToken);
//                    }
//                    if (u.getProfileImage() == null || u.getProfileImage().isBlank()) {
//                        String uploaded = uploadIfNeeded(pictureUrl, email);
//                        u.setProfileImage(uploaded != null ? uploaded : pictureUrl);
//                    }
//                    return u;
//                })
//                .orElseGet(() -> {
//                    User newUser = new User();
//                    newUser.setEmail(email);
//                    newUser.setName(name);
//                    newUser.setProfileImage(profileImageToUse);
//                    newUser.setGoogleAccessToken(accessToken);
//                    newUser.setGoogleRefreshToken(refreshToken);
//
//                    ProjectCount projectCount = ProjectCount.builder()
//                            .upComing(0)
//                            .inProgress(0)
//                            .finished(0)
//                            .user(newUser)
//                            .build();
//                    newUser.setProjectCount(projectCount);
//
//                    return newUser;
//                });
//
//        userRepository.save(user);
//
//        return oauth2User;
//    }

        // DB 저장/갱신
        User user = userRepository.findByEmail(email)
                .map(u -> {
                    u.setName(name);
                    u.setGoogleAccessToken(accessToken); // !수정! 첫 로그인에도 저장
                    if (refreshToken != null) u.setGoogleRefreshToken(refreshToken);
                    if (u.getProfileImage() == null || u.getProfileImage().isBlank()) {
                        u.setProfileImage(profileImageToUse); // !수정! S3 업로드된 이미지 반영
                    }
                    return u;
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProfileImage(profileImageToUse); // !수정!
                    newUser.setGoogleAccessToken(accessToken); // !수정!
                    newUser.setGoogleRefreshToken(refreshToken);

                    ProjectCount projectCount = ProjectCount.builder()
                            .upComing(0)
                            .inProgress(0)
                            .finished(0)
                            .user(newUser)
                            .build();
                    newUser.setProjectCount(projectCount);

                    return newUser;
                });

        userRepository.save(user);

        // CustomOAuth2User 반환
        return new CustomOAuth2User(user, oauth2User.getAttributes()); // !수정!

    }

    private String uploadImageFromUrlToS3(String imageUrl, String email) throws IOException {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<byte[]> response = restTemplate.exchange(
                imageUrl,
                HttpMethod.GET,
                null,
                byte[].class
        );

        byte[] imageBytes = response.getBody();

        String fileName = "images/profile_" + email + ".jpg";
        return s3Service.upload(imageBytes, fileName, "image/jpeg");
    }

    private String uploadIfNeeded(String pictureUrl, String email) {
        if (pictureUrl == null || pictureUrl.isBlank()) return null;

        try {
            return uploadImageFromUrlToS3(pictureUrl, email);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
