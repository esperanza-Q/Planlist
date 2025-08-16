package org.example.planlist.service.Travel;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.TravelDTO.Response.MemoDTO;
import org.example.planlist.dto.TravelDTO.Response.ParticipantDTO;
import org.example.planlist.dto.TravelDTO.Response.ProjectInfoDTO;
import org.example.planlist.dto.TravelDTO.Response.TravelProjectDetailResponseDTO;
import org.example.planlist.entity.Note;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.User;
import org.example.planlist.repository.NoteRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelProjectService {

    private final PlannerProjectRepository projectRepo;
    private final ProjectParticipantRepository participantRepo;
    private final NoteRepository noteRepo;

    @Transactional(readOnly = true)
    public TravelProjectDetailResponseDTO getTravelProjectDetail(Long projectId) {
        PlannerProject project = projectRepo.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));

        // Project
        ProjectInfoDTO projectInfo = ProjectInfoDTO.builder()
                .projectId(project.getProjectId())
                .projectName(project.getProjectTitle())
                .category(project.getCategory().name())
                .status(project.getStatus().name())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .confirmedAt(project.getConfirmedAt())
                .build();

        // Participants
        List<ParticipantDTO> participants = participantRepo.findByProject_ProjectId(projectId)
                .stream()
                .map(p -> ParticipantDTO.builder()
                        .name(p.getUser().getName())
                        .profileImage(p.getUser().getProfileImage())
                        .build())
                .toList();

        // Memo
        User user = SecurityUtil.getCurrentUser();
        List<MemoDTO> memos = noteRepo.findByProject_ProjectId(projectId)
                .stream()
                .filter(n -> n.getUser().getId().equals(user.getId())
                        || n.getShare() == Note.Share.GROUP)
                .map(n -> MemoDTO.builder()
                        .noteId(n.getNoteId())
                        .title(n.getTitle())
                        .share(n.getShare().name())
                        .build())
                .toList();

        return TravelProjectDetailResponseDTO.builder()
                .project(projectInfo)   // ✅ 단일 객체로
                .participants(participants)
                .memo(memos)
                .build();
    }

}

