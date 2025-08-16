package org.example.planlist.dto.StandardDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.planlist.entity.ProjectParticipant;

import java.util.List;

@Data
public class InviteUserResponseDTO {

    private List<org.example.planlist.dto.StandardDTO.response.InviteUserResponseDTO.MyFriendDTO> myFriend;
    private List<org.example.planlist.dto.StandardDTO.response.InviteUserResponseDTO.ParticipantDTO> participants;

    @Data
    @AllArgsConstructor
    public static class MyFriendDTO {
        private Long userId;
        private String name;
        private String email;
        private String profileImage;
    }

    @Data
    @AllArgsConstructor
    public static class ParticipantDTO {
        private Long userId;
        private String name;
        private String profileImage;
        private ProjectParticipant.Response response;    // ACCEPTED / REJECTED / WAITING
    }
}