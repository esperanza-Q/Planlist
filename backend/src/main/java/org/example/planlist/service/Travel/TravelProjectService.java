package org.example.planlist.service.Travel;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.DatePlannerDTO.DatePlannerResponseDTO;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesResponseDTO;
import org.example.planlist.dto.TravelDTO.Response.MemoDTO;
import org.example.planlist.dto.TravelDTO.Response.ParticipantDTO;
import org.example.planlist.dto.TravelDTO.Response.ProjectInfoDTO;
import org.example.planlist.dto.TravelDTO.Response.TravelProjectDetailResponseDTO;
import org.example.planlist.entity.DatePlanner;
import org.example.planlist.entity.MoveBetweenPlaces;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;
import org.example.planlist.repository.DatePlannerRepository;
import org.example.planlist.repository.MoveBetweenPlacesRepository;
import org.example.planlist.repository.NoteRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TravelProjectService {

    private final PlannerProjectRepository projectRepo;
    private final ProjectParticipantRepository participantRepo;
    private final NoteRepository noteRepo;
    private final DatePlannerRepository datePlannerRepository;
    private final MoveBetweenPlacesRepository moveBetweenPlacesRepository;

    @Transactional(readOnly = true)
    public TravelProjectDetailResponseDTO getTravelProjectDetail(Long projectId) {
        // 1) 프로젝트 기본
        PlannerProject project = projectRepo.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));

        ProjectInfoDTO projectInfo = ProjectInfoDTO.builder()
                .projectId(project.getProjectId())
                .projectName(project.getProjectTitle())
                .category(project.getCategory().name())
                .status(project.getStatus().name())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .confirmedAt(project.getConfirmedAt())
                .build();

        // 2) 참여자
        List<ParticipantDTO> participants = participantRepo.findByProject_ProjectId(projectId)
                .stream()
                .map(p -> ParticipantDTO.builder()
                        .name(p.getUser().getName())
                        .profileImage(p.getUser().getProfileImage())
                        .build())
                .toList();

        // 3) 메모 (내 메모 + 그룹 공유)
        User me = SecurityUtil.getCurrentUser();
        List<MemoDTO> memos = noteRepo.findByProject_ProjectId(projectId)
                .stream()
                .filter(n -> Objects.equals(n.getUser().getId(), me.getId()) || n.getShare() == Note.Share.GROUP)
                .map(n -> MemoDTO.builder()
                        .noteId(n.getNoteId())
                        .title(n.getTitle())
                        .share(n.getShare().name())
                        .build())
                .toList();

        // 4) 날짜별 플래너
        List<DatePlanner> planners = datePlannerRepository.findAllByProject_ProjectId(projectId);
        if (planners.isEmpty()) {
            return TravelProjectDetailResponseDTO.builder()
                    .project(projectInfo)
                    .participants(participants)
                    .memo(memos)
                    .projectDetails(List.of())
                    .build();
        }

        // 5) 이동수단 일괄 조회
        List<Long> calendarIds = planners.stream()
                .map(DatePlanner::getCalendarId)   // ✅ calendarId
                .toList();
        List<MoveBetweenPlaces> transports = moveBetweenPlacesRepository.findAllByDatePlannerIds(calendarIds);

        // 6) datePlannerId -> 이동수단 리스트 맵핑 + 정렬 (travelDate → moveId)
        Map<Long, List<MoveBetweenPlaces>> transportMap = transports.stream()
                .collect(Collectors.groupingBy(t -> t.getDatePlanner().getCalendarId()));

        transportMap.values().forEach(list ->
                list.sort(
                        Comparator
                                .comparing(MoveBetweenPlaces::getTravelDate,
                                        Comparator.nullsFirst(Comparator.naturalOrder()))
                                .thenComparing(MoveBetweenPlaces::getMoveId) // ✅ moveId
                )
        );

        // 7) 엔티티 → 응답 DTO
        List<DatePlannerResponseDTO> projectDetails = planners.stream()
                .map(dp -> {
                    List<MoveBetweenPlacesResponseDTO> tDtos = transportMap
                            .getOrDefault(dp.getCalendarId(), Collections.emptyList()) // ✅ calendarId
                            .stream()
                            .map(this::toMoveBetweenPlacesResponse)
                            .toList();

                    return DatePlannerResponseDTO.builder()
                            .calendarId(dp.getCalendarId()) // ✅ calendarId
                            .date(dp.getDate())
                            .category(dp.getCategory() != null ? dp.getCategory().name() : null)
                            .memo(dp.getMemo())
                            .cost(dp.getCost())
                            .address(dp.getAddress())
                            .latitude(dp.getLatitude())
                            .longitude(dp.getLongitude())
                            .visitTime(dp.getVisitTime())
                            .createdAt(dp.getCreatedAt())
                            .projectId(dp.getProject() != null ? dp.getProject().getProjectId() : null)
                            .wishlistId(dp.getWishlist() != null ? dp.getWishlist().getWishlistId() : null)
                            .wishlistName(dp.getWishlist() != null ? dp.getWishlist().getName() : null)
                            .transportations(tDtos)
                            .build();
                })
                .toList();

        // 8) 최종 응답
        return TravelProjectDetailResponseDTO.builder()
                .project(projectInfo)
                .participants(participants)
                .memo(memos)
                .projectDetails(projectDetails)
                .build();
    }

    // ====== 매퍼 ======
    private MoveBetweenPlacesResponseDTO toMoveBetweenPlacesResponse(MoveBetweenPlaces m) {
        return MoveBetweenPlacesResponseDTO.builder()
                .id(m.getMoveId())  // ✅ moveId
                .transportation(m.getTransportation())
                .durationMin(m.getDurationMin())
                .travelDate(m.getTravelDate())
                .build();
    }
}
