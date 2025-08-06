package org.example.planlist.service.Profile;



import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.FriendDTO.request.FriendEmailRequestDTO;
import org.example.planlist.dto.NoteDTO.NoteDTO;
import org.example.planlist.dto.ProfileDTO.ProfileDTO;
import org.example.planlist.dto.ProfileDTO.ProjectRequestDTO;
import org.example.planlist.dto.ProfileDTO.ProjectRequestWrapperDTO;
import org.example.planlist.dto.ProfileDTO.request.ProjectRequestIdDTO;
import org.example.planlist.entity.*;
import org.example.planlist.repository.ProjectParticipantRepository;
import org.example.planlist.security.SecurityUtil;
import org.example.planlist.service.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j


public class ProfileService {
    private final ProjectParticipantRepository projectParticipantRepository;


    @Transactional(readOnly = true)
    public ProjectRequestWrapperDTO getProfile() {
        User user = SecurityUtil.getCurrentUser();

        // 유저 프로필 DTO 생성
        ProfileDTO profileDTO = new ProfileDTO();
        profileDTO.setName(user.getName());
        profileDTO.setEmail(user.getEmail());
        profileDTO.setProfileImage(user.getProfileImage());

        // 유저가 참가한 프로젝트 리스트 조회
        List<ProjectParticipant> projectParticipants = projectParticipantRepository.findByUser(user);

        // 프로젝트 요청 DTO 변환
        List<ProjectRequestDTO> projectRequestDTOs = projectParticipants.stream()
                .filter(pp -> pp.getResponse() == ProjectParticipant.Response.WAITING)
                .map(pp -> {
                    ProjectRequestDTO dto = new ProjectRequestDTO();
                    dto.setInviteeId(pp.getId());
                    dto.setProjectTitle(pp.getProject().getProjectTitle());
                    dto.setCreator(pp.getProject().getCreator().getName());
                    return dto;
                })
                .collect(Collectors.toList());

        // Wrapper DTO에 담기
        ProjectRequestWrapperDTO wrapperDTO = new ProjectRequestWrapperDTO();
        wrapperDTO.setProfile(profileDTO);
        wrapperDTO.setProjectRequest(projectRequestDTOs);

        return wrapperDTO;
    }

    @Transactional
    public void acceptProjectRequest(ProjectRequestIdDTO projectRequestIdDTO) {

        Long inviteeId = projectRequestIdDTO.getInviteeId();

        ProjectParticipant participant = projectParticipantRepository.findById(inviteeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 참가자입니다. id=" + inviteeId));

        User me = SecurityUtil.getCurrentUser();

        // 본인 확인 (participant.user와 로그인 유저가 같은지 확인)
        if (!participant.getUser().getId().equals(me.getId())) {
            throw new SecurityException("본인 요청만 승인할 수 있습니다.");
        }

        // 상태 업데이트 (예: response 필드를 ACCEPTED로 변경)
        participant.setResponse(ProjectParticipant.Response.ACCEPTED);
        participant.setResponseAt(LocalDateTime.now());

        // JPA 변경감지(dirty checking)에 의해 자동 업데이트 됨


    }


    @Transactional
    public void rejectProjectRequest(ProjectRequestIdDTO projectRequestIdDTO) {

        Long inviteeId = projectRequestIdDTO.getInviteeId();

        ProjectParticipant participant = projectParticipantRepository.findById(inviteeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 참가자입니다. id=" + inviteeId));

        User me = SecurityUtil.getCurrentUser();

        // 본인 확인 (participant.user와 로그인 유저가 같은지 확인)
        if (!participant.getUser().getId().equals(me.getId())) {
            throw new SecurityException("본인 요청만 승인할 수 있습니다.");
        }

        // 상태 업데이트 (예: response 필드를 ACCEPTED로 변경)
        participant.setResponse(ProjectParticipant.Response.REJECTED);
        participant.setResponseAt(LocalDateTime.now());

        // JPA 변경감지(dirty checking)에 의해 자동 업데이트 됨


    }

}
