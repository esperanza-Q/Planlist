package org.example.planlist.mapper;

import org.example.planlist.entity.*;

public class MeetingReferenceMapper {

    public static MeetingReference toEntity(MeetingReferenceRequestDTO dto, MeetingSession planner) {
        return MeetingReference.builder()
                .planner(planner)
                .fileName(dto.getFileName())
                .fileURL(dto.getFileURL())
                .fileType(dto.getFileType())
                .uploadedAt(dto.getUploadedAt())
                .build();
    }

    public static MeetingReferenceResponseDTO toResponseDTO(MeetingReference entity) {
        return MeetingReferenceResponseDTO.builder()
                .fileName(entity.getFileName())
                .fileURL(entity.getFileURL())
                .fileType(entity.getFileType())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }
}
