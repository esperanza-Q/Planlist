package org.example.planlist.service;

import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerRequestDTO;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerResponseDTO;
import org.example.planlist.entity.DatePlanner;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.Wishlist;
import org.example.planlist.repository.DatePlannerRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.repository.WishlistRepository;
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

    public DatePlannerService(DatePlannerRepository datePlannerRepository,
                              PlannerProjectRepository plannerProjectRepository,
                              ProjectParticipantRepository projectParticipantRepository,
                              WishlistRepository wishlistRepository) {
        this.datePlannerRepository = datePlannerRepository;
        this.plannerProjectRepository = plannerProjectRepository;
        this.projectParticipantRepository = projectParticipantRepository;
        this.wishlistRepository = wishlistRepository;
    }

    @Transactional
    public void addDatePlannerItem(Long projectId, String categoryStr, DatePlannerRequestDTO dto) {
        // 1) 프로젝트 체크
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        // 2) 참여자 체크
        ProjectParticipant participant = projectParticipantRepository
                .findByIdAndProject_ProjectId(dto.getInviteeId(), projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트 참여자가 아닙니다."));

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

        // 7) 저장
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

        // 2) 전체 조회 (date가 null이면 모든 날짜 조회)
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

        // 3) 특정 날짜 조회
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
        if (!datePlannerRepository.existsById(calendarId)) {
            throw new EntityNotFoundException("해당 날짜에 삭제할 항목이 없습니다.");
        }
        datePlannerRepository.deleteById(calendarId);
    }
}
