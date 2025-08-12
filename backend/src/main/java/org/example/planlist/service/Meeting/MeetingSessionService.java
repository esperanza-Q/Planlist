package org.example.planlist.service.Meeting;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MeetingDTO.response.*;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingSessionService {

    private final MeetingSessionRepository meetingSessionRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final PlannerSessionRepository plannerSessionRepository;

    @Transactional(readOnly = true)
    public MeetingSessionResponseDTO getMeetingSession(Long sessionId) {
        MeetingSession meetingSession = meetingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다."));


        List<ParticipantDTO> participants = projectParticipantRepository
                .findByProject(meetingSession.getProject())
                .stream()
                .map(pp -> ParticipantDTO.builder()
                        .name(pp.getUser().getName())
                        .profileImage(pp.getUser().getProfileImage())
                        .build()
                ).toList();

        return MeetingSessionResponseDTO.builder()
                .title(meetingSession.getTitle())
                .date(meetingSession.getDate())
                .startTime(meetingSession.getStartTime())
                .endTime(meetingSession.getEndTime())
                .participants(participants)
                .build();
    }
}
