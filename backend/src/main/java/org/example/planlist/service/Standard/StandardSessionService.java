package org.example.planlist.service.Standard;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.StandardDTO.response.*;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StandardSessionService {

    private final StandardSessionRepository standardSessionRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final PlannerSessionRepository plannerSessionRepository;


    @Transactional(readOnly = true)
    public StandardSessionResponseDTO getStandardSession(Long sessionId) {
        StandardSession standardSession = standardSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다."));


        List<ParticipantDTO> participants = projectParticipantRepository
                .findByProject(standardSession.getProject())
                .stream()
                .map(pp -> ParticipantDTO.builder()
                        .name(pp.getUser().getName())
                        .profileImage(pp.getUser().getProfileImage())
                        .build()
                ).toList();


        return StandardSessionResponseDTO.builder()
                .title(standardSession.getTitle())
                .date(standardSession.getDate())
                .startTime(standardSession.getStartTime())
                .endTime(standardSession.getEndTime())
                .participants(participants)
                .build();
    }

}
