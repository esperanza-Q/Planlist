package org.example.planlist.dto.PT.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectParticipant;

import java.util.List;

@Data
public class InviteUserResponseDTO {

    private List<MyFriendDTO> myFriend;
    private List<ParticipantDTO> participants;

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
        private String name;
        private ProjectParticipant.Role role;      // TRAINER / TRAINEE
        private String profileImage;
        private ProjectParticipant.Response response;    // ACCEPTED / REJECTED / WAITING
    }
}