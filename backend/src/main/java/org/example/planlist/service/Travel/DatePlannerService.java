package org.example.planlist.service.Travel;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.planlist.apiPayload.exception.NotProjectParticipantException;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerRequestDTO;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerResponseDTO;
import org.example.planlist.entity.DatePlanner;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.User;
import org.example.planlist.entity.Wishlist;
import org.example.planlist.repository.DatePlannerRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.repository.WishlistRepository;
import org.example.planlist.security.CustomOAuth2User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
public class DatePlannerService {

    private final DatePlannerRepository datePlannerRepository;
    private final PlannerProjectRepository plannerProjectRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;  // ★ 추가

    public DatePlannerService(DatePlannerRepository datePlannerRepository,
                              PlannerProjectRepository plannerProjectRepository,
                              ProjectParticipantRepository projectParticipantRepository,
                              WishlistRepository wishlistRepository,
                              UserRepository userRepository) {
        this.datePlannerRepository = datePlannerRepository;
        this.plannerProjectRepository = plannerProjectRepository;
        this.projectParticipantRepository = projectParticipantRepository;
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;  // ★ 추가
    }

    @Transactional
    public void addDatePlannerItem(Long projectId, String categoryStr, DatePlannerRequestDTO dto) {
        // 1) 프로젝트 체크
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        // 2) 로그인 사용자 → 참가자 검증 (inviteeId 사용 안 함)
        Long userId = getCurrentUserIdOrThrow();
        boolean isParticipant = projectParticipantRepository.existsByProject_ProjectIdAndUserId(projectId, userId);
        if (!isParticipant) throw new NotProjectParticipantException();

        ProjectParticipant participant =
                projectParticipantRepository.findByProject_ProjectIdAndUserId(projectId, userId);

        // 3) 날짜 체크
        if (dto.getDate() == null) {
            throw new IllegalArgumentException("여행 프로젝트 날짜를 선택해주세요.");
        }

        // 4) 카테고리 변환
        DatePlanner.Category category = Arrays.stream(DatePlanner.Category.values())
                .filter(c -> c.name().equalsIgnoreCase(categoryStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다: " + categoryStr));

        // 5) Wishlist 조회 (null 허용)
        Wishlist wishlist = null;
        if (dto.getWishlistId() != null) {
            wishlist = wishlistRepository.findById(dto.getWishlistId())
                    .orElseThrow(() -> new EntityNotFoundException("해당 위시리스트 항목이 없습니다."));
        } else {
            // wishlist 필수인 카테고리 검증
            if (category == DatePlanner.Category.PLACE ||
                    category == DatePlanner.Category.RESTAURANT ||
                    category == DatePlanner.Category.ACCOMMODATION) {
                throw new IllegalArgumentException("이 카테고리는 wishlistId가 필요합니다.");
            }
        }

        // 6) 중복 검사 (wishlist 있을 때만)
        if (wishlist != null &&
                datePlannerRepository.existsByProject_ProjectIdAndCategoryAndWishlist_WishlistId(
                        projectId, category, wishlist.getWishlistId())) {
            throw new IllegalStateException("이미 존재하는 항목입니다.");
        }

        // 7) 저장 (participant = 로그인 사용자)
        DatePlanner datePlanner = DatePlanner.builder()
                .date(dto.getDate())
                .category(category)
                .memo(dto.getMemo())
                .cost(dto.getCost())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .visitTime(dto.getVisitTime())
                .project(project)
                .participant(participant)
                .wishlist(wishlist) // null 가능
                .build();
        datePlannerRepository.save(datePlanner);
    }

    @Transactional
    public List<DatePlannerResponseDTO> getDatePlannerItems(Long projectId, LocalDate date) {
        // 1) 프로젝트 존재 여부 확인
        plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        // 2) 로그인 사용자 → 참가자 검증
        Long userId = getCurrentUserIdOrThrow();
        if (!projectParticipantRepository.existsByProject_ProjectIdAndUserId(projectId, userId)) {
            throw new NotProjectParticipantException();
        }

        // 3) 조회
        if (date == null) {
            return datePlannerRepository.findByProject_ProjectId(projectId)
                    .stream()
                    .map(dp -> DatePlannerResponseDTO.builder()
                            .calendarId(dp.getCalendarId())
                            .date(dp.getDate())
                            .category(dp.getCategory().name())
                            .memo(dp.getMemo())
                            .cost(dp.getCost())
                            .address(dp.getAddress())
                            .latitude(dp.getLatitude())
                            .longitude(dp.getLongitude())
                            .visitTime(dp.getVisitTime())
                            .createdAt(dp.getCreatedAt())
                            .projectId(projectId)
                            .wishlistId(dp.getWishlist() != null ? dp.getWishlist().getWishlistId() : null)
                            .wishlistName(dp.getWishlist() != null ? dp.getWishlist().getName() : null)
                            .build())
                    .toList();
        }

        return datePlannerRepository.findByProject_ProjectIdAndDate(projectId, date)
                .stream()
                .map(dp -> DatePlannerResponseDTO.builder()
                        .calendarId(dp.getCalendarId())
                        .date(dp.getDate())
                        .category(dp.getCategory().name())
                        .memo(dp.getMemo())
                        .cost(dp.getCost())
                        .address(dp.getAddress())
                        .latitude(dp.getLatitude())
                        .longitude(dp.getLongitude())
                        .visitTime(dp.getVisitTime())
                        .createdAt(dp.getCreatedAt())
                        .projectId(projectId)
                        .wishlistId(dp.getWishlist() != null ? dp.getWishlist().getWishlistId() : null)
                        .wishlistName(dp.getWishlist() != null ? dp.getWishlist().getName() : null)
                        .build())
                .toList();
    }

    @Transactional
    public void deleteItem(Long calendarId) {
        DatePlanner target = datePlannerRepository.findById(calendarId)
                .orElseThrow(() -> new EntityNotFoundException("해당 날짜에 삭제할 항목이 없습니다."));

        // ★ 삭제 권한: 로그인 사용자가 해당 프로젝트 참가자인지 확인
        Long userId = getCurrentUserIdOrThrow();
        Long projectId = target.getProject().getProjectId();
        if (!projectParticipantRepository.existsByProject_ProjectIdAndUserId(projectId, userId)) {
            throw new NotProjectParticipantException();
        }

        datePlannerRepository.delete(target);
    }

    /* ==== 로그인 사용자 PK(userId) 추출: OAuth2 / JWT / String principal 대응 ==== */
    private Long getCurrentUserIdOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        Object principal = auth.getPrincipal();

        if (principal instanceof CustomOAuth2User o) {
            User u = o.getUser();
            if (u == null || u.getId() == null) {
                throw new IllegalStateException("OAuth2 사용자 정보를 확인할 수 없습니다.");
            }
            return u.getId();
        }

        if (principal instanceof UserDetails ud) {
            String email = ud.getUsername();
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("이메일로 사용자를 찾을 수 없습니다: " + email));
        }

        if (principal instanceof String s && !"anonymousUser".equals(s)) {
            String email = s;
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("이메일로 사용자를 찾을 수 없습니다: " + email));
        }

        throw new IllegalStateException("지원하지 않는 Principal 타입: " + principal.getClass());
    }
}
