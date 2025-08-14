package org.example.planlist.service.Travel;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.TravelDTO.Request.TravelCreateRequestDTO;
import org.example.planlist.dto.TravelDTO.Request.TravelProjectInviteRequestDTO;
import org.example.planlist.dto.TravelDTO.Response.InviteUserResponseDTO;
import org.example.planlist.dto.TravelDTO.Response.TravelCreateResponseDTO;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TravelService {

    private final PlannerProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectParticipantRepository participantRepository;
    private final FriendRepository friendRepository; // 친구 관계 조회용
    private final PlannerProjectRepository projectRepo;

    public Optional<User> findByEmail(String email) {return userRepository.findByEmail(email);}

    @Transactional
    public TravelCreateResponseDTO createProject(TravelCreateRequestDTO request) {
        User creator = SecurityUtil.getCurrentUser();

        // 1) 프로젝트 생성
        PlannerProject project = PlannerProject.builder()
                .projectTitle(request.getTitle())
                .category(PlannerProject.Category.Travel)
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
                .build();

        participantRepository.save(participant);

        // 3) 응답 생성
        return new TravelCreateResponseDTO(
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
    public void sendTravelInvite(Long projectId, TravelProjectInviteRequestDTO travelProjectInviteRequestDTO) {
        String email = travelProjectInviteRequestDTO.getEmail();
        User receiver = findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자가 없습니다."));

        PlannerProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("해당 프로젝트를 찾을 수 없습니다."));

        Optional<ProjectParticipant> existingParticipantOpt = participantRepository.findByProjectAndUser(project, receiver);

        if (existingParticipantOpt.isPresent()) {
            ProjectParticipant existingParticipant = existingParticipantOpt.get();

            if (existingParticipant.getResponse() == ProjectParticipant.Response.REJECTED) {
                existingParticipant.setResponse(ProjectParticipant.Response.WAITING);
                participantRepository.save(existingParticipant);
                return;
            } else {
                throw new IllegalStateException("이미 해당 사용자에게 초대 요청을 보냈습니다.");
            }
        }

        ProjectParticipant participant = ProjectParticipant.builder()
                .user(receiver)
                .project(project) // 여기서 null이면 project_id null 에러
                .response(ProjectParticipant.Response.WAITING)
                .build();

        participantRepository.save(participant);
    }

    @Transactional
    public void acceptTravelInvite(Long projectId) {
        User currentUser = SecurityUtil.getCurrentUser();

        ProjectParticipant participant = participantRepository
                .findByProject_ProjectIdAndUserId(projectId, currentUser.getId());

        if (participant == null) {
            throw new IllegalArgumentException("해당 프로젝트 초대가 없습니다.");
        }

        participant.setResponse(ProjectParticipant.Response.ACCEPTED);
        participant.setResponseAt(LocalDateTime.now());

        participantRepository.save(participant);
    }


    @Transactional
    public void deleteTravelInvite(Long projectId, Long participantId) {
        ProjectParticipant participant = participantRepository.findByProject_ProjectIdAndUserId(projectId, participantId);

        participantRepository.delete(participant);
    }

    @Transactional
    public String projectConfirm(Long projectId) {
        PlannerProject project = projectRepo.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));

        project.setStatus(PlannerProject.Status.INPROGRESS);
        project.setConfirmedAt(LocalDateTime.now());

        // 변경된 상태는 트랜잭션 커밋 시점에 자동으로 DB에 반영됩니다.

        return "프로젝트 상태가 INPROGRESS로 변경되었습니다.";
    }

}
