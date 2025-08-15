package org.example.planlist.dto.TravelDTO.Response;

import lombok.*;
import org.example.planlist.dto.PtDTO.response.FreeTimeIntervalDTO;
import org.example.planlist.entity.ProjectParticipant;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TravelInviteeFreeTimeResponseDTO {
    private Long inviteeId;
    private String name;
    private String profileImage;
    private ProjectParticipant.Role role;         // TRAINER / TRAINEE
    private ProjectParticipant.Response response; // ACCEPTED / REJECTED / WAITING
    private List<FreeTimeIntervalDTO> freeTimes;  // 개인별 가능 날짜(하루 종일)
    private List<FreeTimeIntervalDTO> commonDates; // 전원 가능한 날짜(하루 종일)
}
