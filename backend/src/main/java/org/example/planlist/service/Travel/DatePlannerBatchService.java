package org.example.planlist.service.Travel;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.DatePlannerDTO.*;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesRequestDTO;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
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

    @Transactional
    public DatePlannerBatchSaveResultDTO saveBatch(Long projectId, DatePlannerBatchRequestDTO batchRequest) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        List<Long> savedDatePlannerIds = new ArrayList<>();
        List<Long> savedMoveIds = new ArrayList<>();

        for (DatePlannerBatchItemDTO dto : batchRequest.getItems()) {

            // 🔹 참여자 조회
            ProjectParticipant participant = projectParticipantRepository
                    .findByIdAndProject_ProjectId(dto.getInviteeId(), projectId)
                    .orElseThrow(() -> new EntityNotFoundException("프로젝트 참여자가 아닙니다."));

            // 🔹 카테고리 변환
            DatePlanner.Category category = Arrays.stream(DatePlanner.Category.values())
                    .filter(c -> c.name().equalsIgnoreCase(dto.getCategory()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다."));

            // 🔹 Wishlist 존재 여부 확인
            Wishlist wishlist = null;
            if (dto.getWishlistId() != null) {
                wishlist = wishlistRepository.findById(dto.getWishlistId())
                        .orElseThrow(() -> new EntityNotFoundException("해당 위시리스트 항목이 없습니다."));

                // 📌 동일 날짜 + 카테고리 + 위시리스트 중복 방지
                boolean exists = datePlannerRepository.existsByProject_ProjectIdAndDateAndCategoryAndWishlist_WishlistId(
                        projectId,
                        dto.getDate(),
                        category,
                        wishlist.getWishlistId()
                );
                if (exists) {
                    continue; // 중복이면 저장 스킵
                }
            }

            // 🔹 DatePlanner 저장
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
                    .wishlist(wishlist)
                    .build();

            datePlannerRepository.save(datePlanner);
            savedDatePlannerIds.add(datePlanner.getCalendarId());

            // 🔹 MoveBetweenPlaces 저장
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

        // 🔹 저장 결과 반환
        return DatePlannerBatchSaveResultDTO.builder()
                .datePlannerIds(savedDatePlannerIds)
                .moveBetweenPlacesIds(savedMoveIds)
                .build();
    }

}

