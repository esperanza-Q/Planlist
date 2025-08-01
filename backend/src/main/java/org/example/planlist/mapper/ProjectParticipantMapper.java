package org.example.planlist.mapper;

import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantResponseDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;
import org.example.planlist.entity.ProjectParticipant;

public class ProjectParticipantMapper {

    public static ProjectParticipant toEntity(ProjectParticipantRequestDTO dto, User user, PlannerProject project) {
        return ProjectParticipant.builder()
                .project(project)
                .user(user)
                .response(dto.getResponse())
                .responseAt(dto.getResponseAt())
                .role(dto.getRole())
                .build();
    }

    public static ProjectParticipantResponseDTO toResponseDTO(ProjectParticipant entity) {
        return ProjectParticipantResponseDTO.builder()
                .response(entity.getResponse())
                .role(entity.getRole())
                .build();
    }
}
