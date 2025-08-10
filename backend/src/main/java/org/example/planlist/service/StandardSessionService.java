package org.example.planlist.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.StandardSessionDTO.StandardSessionRequestDTO;
import org.example.planlist.dto.StandardSessionDTO.StandardSessionResponseDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.StandardSession;
import org.example.planlist.mapper.StandardSessionMapper;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.StandardSessionRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StandardSessionService {

    private final PlannerProjectRepository plannerProjectRepository;
    private final StandardSessionRepository standardSessionRepository;

    @Transactional
    public StandardSessionResponseDTO createStandardSession(StandardSessionRequestDTO dto) {
        PlannerProject project = plannerProjectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("프로젝트 없음"));

        if (project.getCategory() != PlannerProject.Category.Standard) {
            throw new IllegalStateException("카테고리가 STANDARD 가 아닙니다.");
        }

        StandardSession session = StandardSessionMapper.toEntity(dto, project);
        standardSessionRepository.save(session);
        return StandardSessionMapper.toResponseDTO(session);
    }
}
