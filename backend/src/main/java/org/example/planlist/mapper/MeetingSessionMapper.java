package org.example.planlist.mapper;

import org.example.planlist.dto.MeetingSessionDTO.MeetingSessionRequestDTO;
import org.example.planlist.dto.MeetingSessionDTO.MeetingSessionResponseDTO;
import org.example.planlist.entity.MeetingSession;
import org.example.planlist.entity.PlannerProject;

public class MeetingSessionMapper {

    public static MeetingSession toEntity(MeetingSessionRequestDTO dto, PlannerProject project) {
        return MeetingSession.builder()
                .project(project)
                .title(dto.getTitle())
                .week(dto.getWeek())
                .date(dto.getDate())
                .time(dto.getTime())
                .location(dto.getLocation())
                .isFinalized(dto.getIsFinalized())
                .isRecurring(dto.getIsRecurring())
                .recurrenceUnit(dto.getRecurrenceUnit())
                .recurrenceCount(dto.getRecurrenceCount())
                .build();
    }

    public static MeetingSessionResponseDTO toResponseDTO(MeetingSession entity) {
        return MeetingSessionResponseDTO.builder()
                .plannerId(entity.getId())
                .projectId(entity.getProject().getId())
                .title(entity.getTitle())
                .week(entity.getWeek())
                .date(entity.getDate())
                .time(entity.getTime())
                .location(entity.getLocation())
                .isFinalized(entity.getIsFinalized())
                .isRecurring(entity.getIsRecurring())
                .recurrenceUnit(entity.getRecurrenceUnit())
                .recurrenceCount(entity.getRecurrenceCount())
                .build();
    }
}
