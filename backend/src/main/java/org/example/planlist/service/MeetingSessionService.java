package org.example.planlist.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MeetingSessionDTO.MeetingSessionRequestDTO;
import org.example.planlist.dto.MeetingSessionDTO.MeetingSessionResponseDTO;
import org.example.planlist.entity.MeetingSession;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.mapper.MeetingSessionMapper;
import org.example.planlist.repository.MeetingSessionRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MeetingSessionService {

    private final PlannerProjectRepository plannerProjectRepository;
    private final MeetingSessionRepository meetingSessionRepository;

    @Transactional
    public MeetingSessionResponseDTO createMeetingSession(MeetingSessionRequestDTO dto) {
        PlannerProject project = plannerProjectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));

        if (project.getCategory() != PlannerProject.Category.Meeting) {
            throw new IllegalStateException("카테고리가 MEETING 이 아닙니다.");
        }

        MeetingSession session = MeetingSessionMapper.toEntity(dto, project);
        meetingSessionRepository.save(session);
        return MeetingSessionMapper.toResponseDTO(session);
    }
}
