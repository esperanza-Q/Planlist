package org.example.planlist.mapper;

import org.example.planlist.dto.StandardSessionDTO.StandardSessionRequestDTO;
import org.example.planlist.dto.StandardSessionDTO.StandardSessionResponseDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.StandardSession;

public class StandardSessionMapper {

    public static StandardSession toEntity(StandardSessionRequestDTO dto, PlannerProject project) {
        return StandardSession.builder()
                .project(project)
                .title(dto.getTitle())
                //‼️여기 수정하세요‼️
//                .week(dto.getWeek())
                .date(dto.getDate())
                //‼️여기 수정하세요‼️
//                .time(dto.getTime())
                .location(dto.getLocation())
                .isFinalized(dto.getIsFinalized())
                .build();
    }

    public static StandardSessionResponseDTO toResponseDTO(StandardSession entity) {
        return StandardSessionResponseDTO.builder()
                .title(entity.getTitle())
                //‼️여기 수정하세요‼️
//                .week(entity.getWeek())
                .date(entity.getDate())
                //‼️여기 수정하세요‼️
//                .time(entity.getTime())
                .location(entity.getLocation())
                .isFinalized(entity.getIsFinalized())
                .build();
    }
}
