package org.example.planlist.dto.MeetingDTO.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MeetingProjectDetailResponseDTO {
    private List<ProjectInfoDTO> Projects;
    private List<ParticipantDTO> Participants;
    private List<MeetingSessionDTO> Meeting_session;
    private List<MemoDTO> Memo;
}