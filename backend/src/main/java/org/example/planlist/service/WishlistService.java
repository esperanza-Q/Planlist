package org.example.planlist.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.planlist.dto.WishlistDTO.WishlistRequestDTO;
import org.example.planlist.dto.WishlistDTO.WishlistResponseDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.User;
import org.example.planlist.entity.Wishlist;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.repository.WishlistRepository;
import org.example.planlist.security.CustomOAuth2User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {
    private final PlannerProjectRepository plannerProjectRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    public WishlistService(PlannerProjectRepository plannerProjectRepository,
                           WishlistRepository wishlistRepository,
                           ProjectParticipantRepository projectParticipantRepository,
                           UserRepository userRepository) {
        this.plannerProjectRepository = plannerProjectRepository;
        this.wishlistRepository = wishlistRepository;
        this.projectParticipantRepository = projectParticipantRepository;
        this.userRepository = userRepository;
    }

    /** 현재 로그인한 사용자 PK(userId) 추출: OAuth2 / JWT 모두 대응 */
    private Long getCurrentUserIdOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        Object principal = auth.getPrincipal();

        // 1) OAuth2 흐름: CustomOAuth2User → User 엔티티의 PK 사용
        if (principal instanceof CustomOAuth2User o) {
            User u = o.getUser();
            if (u == null || u.getId() == null) {
                throw new IllegalStateException("OAuth2 사용자 정보를 확인할 수 없습니다.");
            }
            return u.getId();
        }

        // 2) JWT 흐름: UserDetails → username(대개 이메일)로 조회
        if (principal instanceof UserDetails ud) {
            String email = ud.getUsername();
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("이메일로 사용자를 찾을 수 없습니다: " + email));
        }

        // 3) 문자열 principal (anonymousUser 제외) → 이메일로 조회
        if (principal instanceof String s && !"anonymousUser".equals(s)) {
            String email = s;
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("이메일로 사용자를 찾을 수 없습니다: " + email));
        }

        throw new IllegalStateException("지원하지 않는 Principal 타입: " + principal.getClass());
    }

    /** 위시리스트 항목 추가 */
    @Transactional
    public void addItem(Long projectId, String categoryStr, WishlistRequestDTO dto) {
        // 0) 현재 사용자
        Long currentUserId = getCurrentUserIdOrThrow();

        // 1) 프로젝트 존재 체크
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        // 2) (projectId, userId)로 참여자 검증 (레포는 그대로, 서비스에서 감싸기)
        ProjectParticipant participant = Optional
                .ofNullable(projectParticipantRepository.findByProject_ProjectIdAndUserId(projectId, currentUserId))
                .orElseThrow(() -> new EntityNotFoundException("프로젝트 참여자가 아닙니다."));

        // 승인된 멤버만 허용하려면 주석 해제
        // if (participant.getResponse() != ProjectParticipant.Response.ACCEPTED) {
        //     throw new IllegalStateException("승인된 참여자만 추가할 수 있습니다.");
        // }

        // 3) 카테고리 변환 (PathVariable)
        Wishlist.Category category = java.util.Arrays.stream(Wishlist.Category.values())
                .filter(c -> c.name().equalsIgnoreCase(categoryStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다: " + categoryStr));

        // 4) 중복 검사 (프로젝트 내 동일 카테고리+이름)
        if (wishlistRepository.existsByProject_ProjectIdAndCategoryAndName(projectId, category, dto.getName())) {
            throw new IllegalStateException("이미 존재하는 항목입니다.");
        }

        // 5) 저장
        Wishlist wishlist = Wishlist.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .category(category)
                .memo(dto.getMemo())
                .cost(dto.getCost() == null ? null : dto.getCost().longValue())
                .project(project)
                .participant(participant)
                .build();

        wishlistRepository.save(wishlist);
    }

    /** 카테고리별/전체 조회 */
    @Transactional
    public List<WishlistResponseDTO> getWishlistItems(Long projectId, String categoryStr) {
        // 1) 프로젝트 존재 체크
        plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        // 2) "ALL" 전체 조회
        if (categoryStr.equalsIgnoreCase("ALL")) {
            return wishlistRepository.findByProject_ProjectId(projectId)
                    .stream()
                    .map(w -> WishlistResponseDTO.builder()
                            .wishlistId(w.getWishlistId())
                            .name(w.getName())
                            .address(w.getAddress())
                            .latitude(w.getLatitude())
                            .longitude(w.getLongitude())
                            .category(w.getCategory().name())
                            .memo(w.getMemo())
                            .cost(w.getCost())
                            .projectId(w.getProject().getProjectId())
                            .inviteeId(w.getParticipant().getId()) // participant PK
                            .build())
                    .toList();
        }

        // 3) 카테고리 변환
        Wishlist.Category category = java.util.Arrays.stream(Wishlist.Category.values())
                .filter(c -> c.name().equalsIgnoreCase(categoryStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다: " + categoryStr));

        // 4) 카테고리별 조회
        return wishlistRepository.findByProject_ProjectIdAndCategory(projectId, category)
                .stream()
                .map(w -> WishlistResponseDTO.builder()
                        .name(w.getName())
                        .address(w.getAddress())
                        .latitude(w.getLatitude())
                        .longitude(w.getLongitude())
                        .category(w.getCategory().name())
                        .memo(w.getMemo())
                        .cost(w.getCost())
                        .projectId(w.getProject().getProjectId())
                        .inviteeId(w.getParticipant().getId())
                        .build())
                .toList();
    }

    /** 항목 삭제(권한 체크 포함, 시그니처 유지) */
    @Transactional
    public void deleteItem(Long wishlistId) {
        // 0) 현재 사용자
        Long currentUserId = getCurrentUserIdOrThrow();

        // 1) 항목 존재 확인
        Wishlist target = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new EntityNotFoundException("삭제할 위시리스트 항목이 없습니다."));

        // 2) 요청자가 해당 프로젝트 참여자인지 검증
        Long projectId = target.getProject().getProjectId();
        Optional.ofNullable(projectParticipantRepository.findByProject_ProjectIdAndUserId(projectId, currentUserId))
                .orElseThrow(() -> new EntityNotFoundException("프로젝트 참여자가 아닙니다."));

        // 필요 시 승인 상태 확인
        // if (participant.getResponse() != ProjectParticipant.Response.ACCEPTED) {
        //     throw new IllegalStateException("승인된 참여자만 삭제할 수 있습니다.");
        // }

        // 3) 삭제
        wishlistRepository.deleteById(wishlistId);
    }
}
