package org.example.planlist.mapper;

import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectRequestDTO;
import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectResponseDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;

import java.time.LocalDateTime;

public class PlannerProjectMapper {

    public static PlannerProject toEntity(PlannerProjectRequestDTO dto, User creator) {
        return PlannerProject.builder()
                .creator(creator)
                .projectTitle(dto.getProjectTitle())
                .category(dto.getCategory())
                .status(PlannerProject.Status.UPCOMING)
                .confirmedAt(dto.getConfirmedAt())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public static PlannerProjectResponseDTO toResponseDTO(PlannerProject entity) {
        return PlannerProjectResponseDTO.builder()
                .projectTitle(entity.getProjectTitle())
                .category(entity.getCategory())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .confirmedAt(entity.getConfirmedAt())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .build();
    }
}
