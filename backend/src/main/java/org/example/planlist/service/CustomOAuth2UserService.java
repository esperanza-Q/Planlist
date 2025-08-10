package org.example.planlist.service;

import org.example.planlist.entity.ProjectCount;
import org.example.planlist.entity.User;
import org.example.planlist.repository.UserRepository;
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

//@Service
//public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
//
//    private final UserRepository userRepository;
//    private final S3Service s3Service;
//    private final OAuth2AuthorizedClientService authorizedClientService;
//    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
//
//    public CustomOAuth2UserService(UserRepository userRepository, S3Service s3Service, OAuth2AuthorizedClientService authorizedClientService) {
//        this.userRepository = userRepository;
//        this.s3Service = s3Service;
//        this.authorizedClientService = authorizedClientService;
//    }
//
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
//        OAuth2User oauth2User = delegate.loadUser(userRequest);
//
//        String registrationId = userRequest.getClientRegistration().getRegistrationId();
//        String email = oauth2User.getAttribute("email");
//        String name = oauth2User.getAttribute("name");
//        String pictureUrl = oauth2User.getAttribute("picture");
//
//        // 여기서 Access Token 가져오기
////        String accessToken = userRequest.getAccessToken().getTokenValue();
//
//        // 현재 인증된 사용자 이름(principal name) 가져오기
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String principalName = authentication.getName();
//
//        // AuthorizedClient에서 토큰 꺼내기
//        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
//                userRequest.getClientRegistration().getRegistrationId(),
//                principalName
//        );
//
//        String accessToken = authorizedClient.getAccessToken().getTokenValue();
//        String refreshToken = authorizedClient.getRefreshToken() != null
//                ? authorizedClient.getRefreshToken().getTokenValue()
//                : null;
//
////        String accessToken = authorizedClient.getAccessToken().getTokenValue();
////        String refreshToken = authorizedClient.getRefreshToken() != null
////                ? authorizedClient.getRefreshToken().getTokenValue()
////                : null;
//
//        String finalProfileImage = null;
//        if (pictureUrl != null && !pictureUrl.isBlank()) {
//            try {
//                finalProfileImage = uploadImageFromUrlToS3(pictureUrl, email);
//            } catch (Exception e) {
//                e.printStackTrace();
//                finalProfileImage = pictureUrl;
//            }
//        }
//
//
//
//        String profileImageToUse = finalProfileImage != null ? finalProfileImage : pictureUrl;
//
//        User user = userRepository.findByEmail(email)
//                .map(u -> {
//                    u.setName(name);
//                    u.setGoogleAccessToken(accessToken); // 로그인 시마다 토큰 갱신
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
//
//                    // 필요시 초기값 세팅
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
//
//    private String uploadImageFromUrlToS3(String imageUrl, String email) throws IOException {
//        RestTemplate restTemplate = new RestTemplate();
//        ResponseEntity<byte[]> response = restTemplate.exchange(
//                imageUrl,
//                HttpMethod.GET,
//                null,
//                byte[].class);
//
//        byte[] imageBytes = response.getBody();
//
//        String fileName = "images/profile_" + email + ".jpg";
//        return s3Service.upload(imageBytes, fileName, "image/jpeg");
//    }
//
//    private String uploadIfNeeded(String pictureUrl, String email) {
//        if (pictureUrl == null || pictureUrl.isBlank()) return null;
//
//        try {
//            return uploadImageFromUrlToS3(pictureUrl, email);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return null;
//        }
//    }
//}


//@Service
//public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
//
//    private final UserRepository userRepository;
//    private final S3Service s3Service;
//    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
//
//    public CustomOAuth2UserService(UserRepository userRepository, S3Service s3Service) {
//        this.userRepository = userRepository;
//        this.s3Service = s3Service;
//    }
//
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
//        OAuth2User oauth2User = delegate.loadUser(userRequest);
//
//        String email = oauth2User.getAttribute("email");
//        String name = oauth2User.getAttribute("name");
//        String pictureUrl = oauth2User.getAttribute("picture");
//
//        // 최종 프로필 이미지 URL (final 변수로 사용 가능)
//        String finalProfileImage = null;
//
//        if (pictureUrl != null && !pictureUrl.isBlank()) {
//            try {
//                finalProfileImage = uploadImageFromUrlToS3(pictureUrl, email);
//            } catch (Exception e) {
//                e.printStackTrace();
//                finalProfileImage = pictureUrl; // 실패 시 원본 URL 사용
//            }
//        }
//
//        String profileImageToUse = finalProfileImage != null ? finalProfileImage : pictureUrl;
//
//        User user = userRepository.findByEmail(email)
//                .map(u -> {
//                    u.setName(name);
//                    // 프로필 이미지가 없을 때만 업로드
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
//
//
//    }
//
//    private String uploadImageFromUrlToS3(String imageUrl, String email) throws IOException {
//        RestTemplate restTemplate = new RestTemplate();
//        ResponseEntity<byte[]> response = restTemplate.exchange(
//                imageUrl,
//                HttpMethod.GET,
//                null,
//                byte[].class);
//
//        byte[] imageBytes = response.getBody();
//
//        // 파일명 고정 → 덮어쓰기
//        String fileName = "images/profile_" + email + ".jpg";
//        return s3Service.upload(imageBytes, fileName, "image/jpeg");
//    }
//
//    private String uploadIfNeeded(String pictureUrl, String email) {
//        if (pictureUrl == null || pictureUrl.isBlank()) return null;
//
//        try {
//            return uploadImageFromUrlToS3(pictureUrl, email);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return null;
//        }
//    }
//}


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
                : null;

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
        User user = userRepository.findByEmail(email)
                .map(u -> {
                    u.setName(name);
                    if (accessToken != null) {
                        u.setGoogleAccessToken(accessToken);
                    }
                    if (refreshToken != null) {
                        u.setGoogleRefreshToken(refreshToken);
                    }
                    if (u.getProfileImage() == null || u.getProfileImage().isBlank()) {
                        String uploaded = uploadIfNeeded(pictureUrl, email);
                        u.setProfileImage(uploaded != null ? uploaded : pictureUrl);
                    }
                    return u;
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProfileImage(profileImageToUse);
                    newUser.setGoogleAccessToken(accessToken);
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

        return oauth2User;
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
