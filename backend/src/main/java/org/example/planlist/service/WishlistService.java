package org.example.planlist.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.planlist.dto.WishlistDTO.WishlistRequestDTO;
import org.example.planlist.dto.WishlistDTO.WishlistResponseDTO;
import org.example.planlist.entity.*;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.repository.WishlistRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {
    private final PlannerProjectRepository plannerProjectRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final WishlistRepository wishlistRepository;

    public WishlistService(PlannerProjectRepository plannerProjectRepository,
                           WishlistRepository wishlistRepository,
                           ProjectParticipantRepository projectParticipantRepository) {
        this.plannerProjectRepository = plannerProjectRepository;
        this.wishlistRepository = wishlistRepository;
        this.projectParticipantRepository = projectParticipantRepository;
    }

    @Transactional
    public void addItem(Long projectId, String categoryStr, WishlistRequestDTO dto) {
        // 1) 프로젝트 존재 체크
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        // 2) 참여자 조회 (inviteeId = ProjectParticipant PK)
        ProjectParticipant participant = projectParticipantRepository
                .findByIdAndProject_ProjectId(dto.getInviteeId(), projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트 참여자가 아닙니다."));


        // 3) 카테고리 변환 (대소문자 무시)
        Wishlist.Category category = java.util.Arrays.stream(Wishlist.Category.values())
                .filter(c -> c.name().equalsIgnoreCase(categoryStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다: " + categoryStr));

        // 4) 중복 검사: 프로젝트 + 카테고리 + 이름
        if (wishlistRepository.existsByProject_ProjectIdAndCategoryAndName(projectId, category, dto.getName())) {
            throw new IllegalStateException("이미 존재하는 항목입니다.");
        }

        // 5) 저장 (Builder)
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

    @Transactional
    public List<WishlistResponseDTO> getItems(Long projectId, String categoryStr) {
        // 1) 프로젝트 존재 체크
        plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));

        // 2) 카테고리 변환
        Wishlist.Category category = java.util.Arrays.stream(Wishlist.Category.values())
                .filter(c -> c.name().equalsIgnoreCase(categoryStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 카테고리 값입니다: " + categoryStr));

        // 3) 조회 + DTO 변환
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



    @Transactional
    public void deleteItem(Long wishlistId) {
        if (!wishlistRepository.existsById(wishlistId)) {
            throw new EntityNotFoundException("삭제할 위시리스트 항목이 없습니다.");
        }
        wishlistRepository.deleteById(wishlistId);
    }

}



