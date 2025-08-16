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

        if (principal instanceof CustomOAuth2User o) { // OAuth2
            User u = o.getUser();
            if (u == null || u.getId() == null) {
                throw new IllegalStateException("OAuth2 사용자 정보를 확인할 수 없습니다.");
            }
            return u.getId();
        }

        if (principal instanceof UserDetails ud) { // JWT(UserDetails)
            String email = ud.getUsername();
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("이메일로 사용자를 찾을 수 없습니다: " + email));
        }

        if (principal instanceof String s && !"anonymousUser".equals(s)) { // 문자열 principal
            String email = s;
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("이메일로 사용자를 찾을 수 없습니다: " + email));
        }

        throw new IllegalStateException("지원하지 않는 Principal 타입: " + principal.getClass());
    }

    /** 위시리스트 항목 추가 → 저장된 ID를 담아 반환 (함수명/경로/로직 형태 유지) */
    @Transactional
    public WishlistResponseDTO addItem(Long projectId, String categoryStr, WishlistRequestDTO dto) {
        Long currentUserId = getCurrentUserIdOrThrow();

        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        ProjectParticipant participant = Optional
                .ofNullable(projectParticipantRepository.findByProject_ProjectIdAndUserId(projectId, currentUserId))
                .orElseThrow(() -> new EntityNotFoundException("프로젝트 참여자가 아닙니다."));

        Wishlist.Category category = java.util.Arrays.stream(Wishlist.Category.values())
                .filter(c -> c.name().equalsIgnoreCase(categoryStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다: " + categoryStr));

        if (wishlistRepository.existsByProject_ProjectIdAndCategoryAndName(projectId, category, dto.getName())) {
            throw new IllegalStateException("이미 존재하는 항목입니다.");
        }

        Wishlist wishlist = Wishlist.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .category(category)
                .memo(dto.getMemo())
                .cost(dto.getCost() == null ? null : dto.getCost().longValue())
                .project(project)
                .participant(participant) // 참여자(Participant) 저장
                .build();

        Wishlist saved = wishlistRepository.save(wishlist); // ★ 여기서 ID 채워짐

        return WishlistResponseDTO.builder()
                .wishlistId(saved.getWishlistId())
                .name(saved.getName())
                .address(saved.getAddress())
                .latitude(saved.getLatitude())
                .longitude(saved.getLongitude())
                .category(saved.getCategory().name())
                .memo(saved.getMemo())
                .cost(saved.getCost())
                .projectId(saved.getProject().getProjectId())
                .inviteeId(saved.getParticipant() != null ? saved.getParticipant().getId() : null) // Participant PK
                .build();
    }

    /** 카테고리별/전체 조회 (형태 유지 + wishlistId 누락 보강) */
    @Transactional
    public List<WishlistResponseDTO> getWishlistItems(Long projectId, String categoryStr) {
        plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

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
                            .inviteeId(w.getParticipant() != null ? w.getParticipant().getId() : null)
                            .build())
                    .toList();
        }

        Wishlist.Category category = java.util.Arrays.stream(Wishlist.Category.values())
                .filter(c -> c.name().equalsIgnoreCase(categoryStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다: " + categoryStr));

        return wishlistRepository.findByProject_ProjectIdAndCategory(projectId, category)
                .stream()
                .map(w -> WishlistResponseDTO.builder()
                        .wishlistId(w.getWishlistId()) // ← 보강
                        .name(w.getName())
                        .address(w.getAddress())
                        .latitude(w.getLatitude())
                        .longitude(w.getLongitude())
                        .category(w.getCategory().name())
                        .memo(w.getMemo())
                        .cost(w.getCost())
                        .projectId(w.getProject().getProjectId())
                        .inviteeId(w.getParticipant() != null ? w.getParticipant().getId() : null)
                        .build())
                .toList();
    }

    /** 항목 삭제(권한 체크 포함, 시그니처/경로 유지) */
    @Transactional
    public void deleteItem(Long wishlistId) {
        Long currentUserId = getCurrentUserIdOrThrow();

        Wishlist target = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new EntityNotFoundException("삭제할 위시리스트 항목이 없습니다."));

        Long projectId = target.getProject().getProjectId();
        Optional.ofNullable(projectParticipantRepository.findByProject_ProjectIdAndUserId(projectId, currentUserId))
                .orElseThrow(() -> new EntityNotFoundException("프로젝트 참여자가 아닙니다."));

        wishlistRepository.deleteById(wishlistId);
    }
}
