package org.example.planlist.mapper;

import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantResponseDTO;
import org.example.planlist.entity.ProjectParticipant;

public class ProjectParticipantMapper {

    public static ProjectParticipant toEntity(ProjectParticipantRequestDTO dto) {
        return ProjectParticipant.builder()
                .response(dto.getResponse())
                .responseAt(dto.getResponseAt())
                .role(dto.getRole())
                .build();
    }

    public static ProjectParticipantResponseDTO toResponseDTO(ProjectParticipant entity) {
        return ProjectParticipantResponseDTO.builder()
                .inviteeId(entity.getInviteeId())
                .response(entity.getResponse())
                .responseAt(entity.getResponseAt())
                .role(entity.getRole())
                .build();
    }
}
