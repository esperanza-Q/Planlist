package org.example.planlist.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.FriendDTO.response.FriendListResponseDTO;
import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectRequestDTO;
import org.example.planlist.dto.PlannerProjectDTO.PlannerProjectResponseDTO;
import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.dto.PtDTO.response.InviteUserResponseDTO;
import org.example.planlist.dto.PtDTO.response.ParticipantDTO;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.User;
import org.example.planlist.mapper.PlannerProjectMapper;
import org.example.planlist.mapper.ProjectParticipantMapper;
import org.example.planlist.repository.FriendRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.security.SecurityUtil;
import org.example.planlist.service.Friend.FriendService;
import org.example.planlist.service.Friend.FriendService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlannerProjectService {

    private final PlannerProjectRepository plannerProjectRepository;
    private final UserRepository userRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final FriendService friendService;
    private final FriendRepository friendRepository;
//    private final ProjectParticipantRepository participantRepository;

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
        return (List<User>) friendService.getAllFriendsForCurrentUser();
    }
//
//    @Transactional
//    public List<ProjectParticipantRequestDTO> getParticipantList(Long projectId) {
//        return projectParticipantRepository.findAllDtosByProjectId(projectId);
//    }

//    @Transactional
//    public InviteUserResponseDTO getInviteUsers(Long projectId) {
//
//        Long currentUserId = SecurityUtil.getCurrentUser().getId();
//
//        // 1) 현재 로그인 유저 친구 목록 조회 (FriendRepository에서 제대로 조회)
//        List<Long> friendIds = friendRepository.findFriendIdsByUserId(currentUserId);
//        List<User> friends = userRepository.findAllById(friendIds);
//
//        List<InviteUserResponseDTO.MyFriendDTO> myFriendsDto = friends.stream()
//                .map(f -> new InviteUserResponseDTO.MyFriendDTO(
//                        f.getId(),
//                        f.getName(),
//                        f.getEmail(),
//                        f.getProfileImage()))
//                .collect(Collectors.toList());
//
//        // 2) 프로젝트 참가자 전체 조회 (role, status 포함)
//        List<ProjectParticipant> participants = participantRepository.findAllEntitiesByProjectId(projectId);
//
//        List<InviteUserResponseDTO.ParticipantDTO> participantsDto = participants.stream()
//                .map(p -> new InviteUserResponseDTO.ParticipantDTO(
//                        p.getUser().getId(),
//                        p.getUser().getName(),
//                        p.getRole(),
//                        p.getUser().getProfileImage(),
//                        p.getResponse()
//                ))
//                .collect(Collectors.toList());
//
//        // 3) 응답 조립
//        InviteUserResponseDTO response = new InviteUserResponseDTO();
//        response.setMyFriend(myFriendsDto);
//        response.setParticipants(participantsDto);
//
//        return response;
//    }
    @Transactional
    public InviteUserResponseDTO getInviteUsers(Long projectId) {

        Long currentUserId = SecurityUtil.getCurrentUser().getId();

        // 1) 현재 로그인 유저 친구 목록 조회 (FriendRepository에서 제대로 조회)
        List<Long> friendIds = friendRepository.findFriendIdsByUserId(currentUserId);
        List<User> friends = userRepository.findAllById(friendIds);

        List<InviteUserResponseDTO.MyFriendDTO> myFriendsDto = friends.stream()
                .map(f -> new InviteUserResponseDTO.MyFriendDTO(
                        f.getId(),
                        f.getName(),
                        f.getEmail(),
                        f.getProfileImage()))
                .collect(Collectors.toList());

        // 2) 프로젝트 참가자 전체 조회 (role, status 포함)
        List<ProjectParticipant> participants = projectParticipantRepository.findAllEntitiesByProjectId(projectId);

        List<InviteUserResponseDTO.ParticipantDTO> participantsDto = participants.stream()
                .map(p -> new InviteUserResponseDTO.ParticipantDTO(
                        p.getUser().getId(),
                        p.getUser().getName(),
                        p.getRole(),
                        p.getUser().getProfileImage(),
                        p.getResponse()
                ))
                .collect(Collectors.toList());

        // 3) 응답 조립
        InviteUserResponseDTO response = new InviteUserResponseDTO();
        response.setMyFriend(myFriendsDto);
        response.setParticipants(participantsDto);

        return response;
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
//    @Transactional
//    public List<User> searchFriends(String keyword) {
//        return userRepository.searchFriends(keyword);
//    }

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

    // 7. 종료 날짜 설정
    @Transactional
    public void setEndDate(Long projectId, LocalDate endDate) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));
        project.setEndDate(endDate);
    }

    // 8. 프로젝트 최종 확정
    @Transactional
    public void finalizeProject(Long projectId) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));
        project.setStatus(PlannerProject.Status.INPROGRESS);
        project.setCreatedAt(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<PlannerProjectResponseDTO> getMyProjects() {
        // 현재 로그인한 유저
        User currentUser = SecurityUtil.getCurrentUser();

        // 현재 유저가 참가자로 속한 프로젝트 참가 정보들 조회
        List<ProjectParticipant> myParticipations =
                projectParticipantRepository.findByUser(currentUser);

        // ProjectParticipant → PlannerProject → DTO 변환 (중복 제거)
        return myParticipations.stream()
                .map(ProjectParticipant::getProject)
                .distinct()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private PlannerProjectResponseDTO toResponseDTO(PlannerProject project) {
        List<ParticipantDTO> participantDTOs = project.getParticipants().stream()
                .map(pp -> ParticipantDTO.builder()
                        .name(pp.getUser().getName())
                        .profileImage(pp.getUser().getProfileImage())
                        .build())
                .collect(Collectors.toList());

        return PlannerProjectResponseDTO.builder()
                .projectId(project.getProjectId())
                .projectTitle(project.getProjectTitle())
                .category(project.getCategory())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .Participants(participantDTOs)
                .status(project.getStatus())
                .build();
    }


}
