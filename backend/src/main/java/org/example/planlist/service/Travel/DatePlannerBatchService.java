package org.example.planlist.service.Travel;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.planlist.apiPayload.exception.NotProjectParticipantException;
import org.example.planlist.dto.DatePlannerDTO.*;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesRequestDTO;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
import org.example.planlist.security.CustomOAuth2User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DatePlannerBatchService {

    private final DatePlannerRepository datePlannerRepository;
    private final PlannerProjectRepository plannerProjectRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final WishlistRepository wishlistRepository;
    private final MoveBetweenPlacesRepository moveBetweenPlacesRepository;
    private final UserRepository userRepository;   // 로그인 사용자 ID 조회용

    @Transactional
    public DatePlannerBatchSaveResultDTO saveBatch(Long projectId, DatePlannerBatchRequestDTO batchRequest) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        // 로그인 사용자 → 프로젝트 참가자 검증
        Long userId = getCurrentUserIdOrThrow();
        boolean isParticipant = projectParticipantRepository.existsByProject_ProjectIdAndUserId(projectId, userId);
        if (!isParticipant) throw new NotProjectParticipantException();

        ProjectParticipant participant =
                projectParticipantRepository.findByProject_ProjectIdAndUserId(projectId, userId);

        List<Long> savedDatePlannerIds = new ArrayList<>();
        List<Long> savedMoveIds = new ArrayList<>();

        for (DatePlannerBatchItemDTO dto : batchRequest.getItems()) {

            // 1) 카테고리 변환
            DatePlanner.Category category = Arrays.stream(DatePlanner.Category.values())
                    .filter(c -> c.name().equalsIgnoreCase(dto.getCategory()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다."));

            // 2) 위시리스트 필수/존재/일치 검증
            boolean requiresWishlist = (category == DatePlanner.Category.PLACE
                    || category == DatePlanner.Category.RESTAURANT
                    || category == DatePlanner.Category.ACCOMMODATION);

            if (requiresWishlist && dto.getWishlistId() == null) {
                throw new IllegalArgumentException("해당 카테고리는 wishlistId가 필수입니다: " + category.name());
            }

            Wishlist wishlist = null;
            if (dto.getWishlistId() != null) {
                wishlist = wishlistRepository.findById(dto.getWishlistId())
                        .orElseThrow(() -> new EntityNotFoundException("해당 위시리스트 항목이 없습니다."));

                // (안전) 동일 프로젝트 소속인지 확인
                if (!Objects.equals(wishlist.getProject().getProjectId(), projectId)) {
                    throw new IllegalArgumentException("위시리스트가 현재 프로젝트(id=" + projectId + ")에 속하지 않습니다.");
                }

                // (안전) 카테고리 일치 확인
                if (wishlist.getCategory() == null
                        || !wishlist.getCategory().name().equalsIgnoreCase(category.name())) {
                    throw new IllegalArgumentException(
                            "위시리스트의 카테고리(" +
                                    (wishlist.getCategory() != null ? wishlist.getCategory().name() : "null") +
                                    ")가 요청 카테고리(" + category.name() + ")와 일치하지 않습니다.");
                }

                // 3) 중복 방지 (동일 날짜 + 카테고리 + 동일 위시리스트)
                boolean exists = datePlannerRepository
                        .existsByProject_ProjectIdAndDateAndCategoryAndWishlist_WishlistId(
                                projectId, dto.getDate(), category, wishlist.getWishlistId());
                if (exists) {
                    // 중복이면 스킵 (필요 시 누적 실패 리스트 만들어 반환해도 됨)
                    continue;
                }
            }

            // 4) DatePlanner 저장 (participant = 로그인 사용자)
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
                    .wishlist(wishlist) // 비-위치류 카테고리면 null 가능
                    .build();

            datePlannerRepository.save(datePlanner);
            savedDatePlannerIds.add(datePlanner.getCalendarId());

            // 5) 이동수단 저장
            if (dto.getTransportations() != null && !dto.getTransportations().isEmpty()) {
                for (MoveBetweenPlacesRequestDTO tDto : dto.getTransportations()) {
                    MoveBetweenPlaces move = MoveBetweenPlaces.builder()
                            .transportation(tDto.getTransportation())
                            .durationMin(tDto.getDurationMin())
                            .travelDate(tDto.getTravelDate())
                            .datePlanner(datePlanner)
                            .project(project)
                            .build();
                    moveBetweenPlacesRepository.save(move);
                    savedMoveIds.add(move.getMoveId());
                }
            }
        }

        // 결과 반환
        return DatePlannerBatchSaveResultDTO.builder()
                .datePlannerIds(savedDatePlannerIds)
                .moveBetweenPlacesIds(savedMoveIds)
                .build();
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
