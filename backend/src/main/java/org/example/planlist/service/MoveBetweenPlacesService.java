package org.example.planlist.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesRequestDTO;
import org.example.planlist.dto.MoveBetweenPlacesDTO.MoveBetweenPlacesResponseDTO;
import org.example.planlist.entity.DatePlanner;
import org.example.planlist.entity.MoveBetweenPlaces;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.repository.DatePlannerRepository;
import org.example.planlist.repository.MoveBetweenPlacesRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MoveBetweenPlacesService {

    private final MoveBetweenPlacesRepository moveBetweenPlacesRepository;
    private final DatePlannerRepository datePlannerRepository;
    private final PlannerProjectRepository plannerProjectRepository;

    @Transactional
    public void addTransportation(Long projectId, Long datePlannerId, MoveBetweenPlacesRequestDTO dto) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("해당 프로젝트가 없습니다."));

        DatePlanner datePlanner = datePlannerRepository.findById(datePlannerId)
                .orElseThrow(() -> new EntityNotFoundException("해당 날짜별 플래너 항목이 없습니다."));

        MoveBetweenPlaces move = MoveBetweenPlaces.builder()
                .transportation(dto.getTransportation())
                .durationMin(dto.getDurationMin())
                .travelDate(dto.getTravelDate())
                .datePlanner(datePlanner)
                .project(project)
                .build();

        moveBetweenPlacesRepository.save(move);
    }

    @Transactional
    public List<MoveBetweenPlacesResponseDTO> getTransportationsByDatePlanner(Long datePlannerId) {
        return moveBetweenPlacesRepository.findByDatePlanner_CalendarId(datePlannerId)
                .stream()
                .map(e -> MoveBetweenPlacesResponseDTO.builder()
                        .transportation(e.getTransportation())
                        .durationMin(e.getDurationMin())
                        .travelDate(e.getTravelDate())
                        .build())
                .toList();
    }

    @Transactional
    public List<MoveBetweenPlacesResponseDTO> getTransportationsByProject(Long projectId) {
        return moveBetweenPlacesRepository.findByProject_ProjectId(projectId)
                .stream()
                .map(e -> MoveBetweenPlacesResponseDTO.builder()
                        .transportation(e.getTransportation())
                        .durationMin(e.getDurationMin())
                        .travelDate(e.getTravelDate())
                        .build())
                .toList();
    }

    // 이동수단 삭제
    public void deleteTransportation(Long moveId) {
        MoveBetweenPlaces move = moveBetweenPlacesRepository.findById(moveId)
                .orElseThrow(() -> new EntityNotFoundException("이동수단 항목을 찾을 수 없습니다. ID: " + moveId));

        moveBetweenPlacesRepository.delete(move);
    }
}
