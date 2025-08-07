package org.example.planlist.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectRequestDTO;
import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectResponseDTO;
import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.User;
import org.example.planlist.mapper.PlannerProjectMapper;
import org.example.planlist.mapper.ProjectParticipantMapper;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlannerProjectService {

    private final PlannerProjectRepository plannerProjectRepository;
    private final UserRepository userRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final FriendService friendService;

    // 1. 프로젝트 생성 - @PostMapping("/create")
    @Transactional
    public PlannerProjectResponseDTO createPlannerProject(PlannerProjectRequestDTO dto, Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 사용자가 존재하지 않습니다."));
        PlannerProject project = PlannerProjectMapper.toEntity(dto, creator);
        plannerProjectRepository.save(project);
        return PlannerProjectMapper.toResponseDTO(project);
    }

    // 2. 친구 목록 & 참여자 목록 조회 - @PostMapping("/{projectId}/invite")
    @Transactional
    public List<User> getFriendList(Long userId) {
        return friendService.getAllFriends(userId);
    }

    @Transactional
    public List<ProjectParticipantRequestDTO> getParticipantList(Long projectId) {
        return projectParticipantRepository.findAllByProjectId(projectId);
    }

    // 3. 친구 초대 - @PostMapping("/{projectId}/invite/{friendId}")
    @Transactional
    public void inviteFriend(ProjectParticipantRequestDTO dto, Long friendId) {
        PlannerProject project = plannerProjectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프로젝트입니다."));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 사용자입니다."));

        if (projectParticipantRepository.existsByProjectAndUser(project, friend)) {
            throw new IllegalStateException("이미 초대된 사용자입니다.");
        }

        ProjectParticipant participant = ProjectParticipantMapper.toEntity(dto, friend, project);
        projectParticipantRepository.save(participant);
    }

    // 4. 친구 검색 - @PostMapping("/{projectId}/invite/search")
    @Transactional
    public List<User> searchFriends(Long userId, String keyword) {
        return userRepository.searchFriends(userId, keyword);
    }

    // 5. 참여자 삭제 - @DeleteMapping("/{projectId}/delete/participant")
    @Transactional
    public void deleteParticipant(Long participantId) {
        projectParticipantRepository.deleteById(participantId);
    }

    // 6. 시작 날짜 설정
    @Transactional
    public void setStartDate(Long projectId, LocalDate startDate) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));
        project.setStartDate(startDate);
    }

    // 8. 프로젝트 최종 확정
    @Transactional
    public void finalizeProject(Long projectId) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));
        project.setStatus(PlannerProject.Status.INPROGRESS);
        project.setCreatedAt(LocalDateTime.now());
    }
}
