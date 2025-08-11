package org.example.planlist.service.PT;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.FriendDTO.request.RequestSendRequestDTO;
import org.example.planlist.dto.PT.request.PtProjectCreateRequestDTO;
import org.example.planlist.dto.PT.request.PtProjectInviteRequestDTO;
import org.example.planlist.dto.PT.response.InviteUserResponseDTO;
import org.example.planlist.dto.PT.response.PtProjectCreateResponseDTO;
import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
import org.example.planlist.security.SecurityUtil;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PtService {

    private final PlannerProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectParticipantRepository participantRepository;
    private final PtSessionRepository ptSessionRepository;
    private final FriendRepository friendRepository; // 친구 관계 조회용

    public Optional<User> findByEmail(String email) {return userRepository.findByEmail(email);}

    @Transactional
    public PtProjectCreateResponseDTO createProject(PtProjectCreateRequestDTO request) {
        User creator = SecurityUtil.getCurrentUser();

        // 1) 프로젝트 생성
        PlannerProject project = PlannerProject.builder()
                .projectTitle(request.getTitle())
                .category(PlannerProject.Category.PT)
                .status(PlannerProject.Status.UPCOMING)
                .createdAt(LocalDateTime.now())
                .creator(creator)
                .build();

        projectRepository.save(project);

        // 2) 프로젝트 참여자 추가 (creator + ACCEPTED + role)
        ProjectParticipant participant = ProjectParticipant.builder()
                .project(project)
                .user(creator)
                .response(ProjectParticipant.Response.ACCEPTED)
                .responseAt(LocalDateTime.now())
                .role(request.getRole())
                .build();

        participantRepository.save(participant);

        // 3) PtSession 및 PlannerSession 생성 (PtSession은 PlannerSession 상속)
//        PtSession ptSession = PtSession.builder()
//                .projectTitle(request.getTitle())
//                .project(project)
//                .isFinalized(false)
//                .build();

//        ptSessionRepository.save(ptSession);

        // 4) 응답 생성
        return new PtProjectCreateResponseDTO(
                project.getProjectId(),
                creator.getId(),
                project.getProjectTitle(),
                project.getCategory(),
                project.getStatus(),
                project.getCreatedAt()
        );
    }

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
        List<ProjectParticipant> participants = participantRepository.findAllEntitiesByProjectId(projectId);

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

    @Transactional
    public void sendPtInvite(Long projectId, PtProjectInviteRequestDTO ptProjectInviteRequestDTO) {

        String email = ptProjectInviteRequestDTO.getEmail();
        User receiver = findByEmail(email).orElseThrow(() ->
                new IllegalArgumentException("해당 이메일의 사용자가 없습니다."));
        User creater = SecurityUtil.getCurrentUser();
        ProjectParticipant.Role role = ptProjectInviteRequestDTO.getRole();

        PlannerProject project = projectRepository.findByProjectId(projectId);

        // 🔒 이미 요청이 존재하는지 확인
        if (participantRepository.existsByProjectAndUser(project, receiver)) {
            throw new IllegalStateException("이미 해당 사용자에게 초대 요청을 보냈습니다.");
        }


        ProjectParticipant participant = ProjectParticipant.builder()
                .user(receiver)
                .project(project)
                .response(ProjectParticipant.Response.WAITING)
                .role(role)
//                .message(requestSendRequestDTO.getMessage()) // 필요하다면
                .build();

        participantRepository.save(participant);
    }

    @Transactional
    public void deletePtInvite(Long projectId, Long participantId) {
        ProjectParticipant participant = participantRepository.findByProject_ProjectIdAndUserId(projectId, participantId);

        participantRepository.delete(participant);
    }


}
