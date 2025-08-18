package org.example.planlist.service.Meeting;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.MeetingDTO.response.MeetingProjectDetailResponseDTO;
import org.example.planlist.dto.MeetingDTO.response.*;
import org.example.planlist.dto.MeetingDTO.response.MeetingSessionDTO;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;
import org.example.planlist.repository.*;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingProjectService {
    private final PlannerProjectRepository projectRepo;
    private final ProjectParticipantRepository participantRepo;
    private final MeetingSessionRepository meetingSessionRepo;
    private final NoteRepository noteRepo;

    @Transactional(readOnly = true)
    public MeetingProjectDetailResponseDTO getMeetingProjectDetail(Long projectId) {
        PlannerProject project = projectRepo.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));

        // Projects
        List<ProjectInfoDTO> projectInfo = List.of(
                ProjectInfoDTO.builder()
                        .projectId(project.getProjectId())
                        .projectName(project.getProjectTitle())
                        .category(project.getCategory().name())
                        .status(project.getStatus().name())
                        .startDate(project.getStartDate())
                        .endDate(project.getEndDate())
                        .confirmedAt(project.getConfirmedAt())
                        .build()
        );

        // Participants
        List<ParticipantDTO> participants = participantRepo.findByProject_ProjectId(projectId)
                .stream()
                .map(p -> ParticipantDTO.builder()
                        .name(p.getUser().getName())
                        .profileImage(p.getUser().getProfileImage())
                        .build())
                .toList();

        // Meeting_session
        List<MeetingSessionDTO> meetingSessions = meetingSessionRepo.findByProject_ProjectId(projectId)
                .stream()
                .map(s -> MeetingSessionDTO.builder()
                        .plannerId(s.getId())
                        .title(s.getTitle())
                        .is_finalized(s.getIsFinalized())
                        .build())
                .toList();

        // Memo
        User user = SecurityUtil.getCurrentUser();

        List<MemoDTO> memos = noteRepo.findByProject_ProjectId(projectId)
                .stream()
                .filter(n ->
                        n.getUser().getId().equals(user.getId()) // 내가 작성한 노트
                                || n.getShare() == Note.Share.GROUP     // 남이 작성했지만 GROUP인 노트
                )
                .map(n -> MemoDTO.builder()
                        .noteId(n.getNoteId())
                        .title(n.getTitle())
                        .share(n.getShare().name())
                        .build())
                .toList();

        return MeetingProjectDetailResponseDTO.builder()
                .Projects(projectInfo)
                .Participants(participants)
                .Meeting_session(meetingSessions)
                .Memo(memos)
                .build();
    }
}
