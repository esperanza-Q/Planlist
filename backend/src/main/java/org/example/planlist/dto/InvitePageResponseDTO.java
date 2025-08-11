package org.example.planlist.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.planlist.dto.FriendDTO.response.FriendListResponseDTO;
import org.example.planlist.dto.ProjectParticipantDTO.ProjectParticipantRequestDTO;
import org.example.planlist.entity.User;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvitePageResponseDTO {
    private FriendListResponseDTO friendList;
    private List<ProjectParticipantRequestDTO> participantList;
}
