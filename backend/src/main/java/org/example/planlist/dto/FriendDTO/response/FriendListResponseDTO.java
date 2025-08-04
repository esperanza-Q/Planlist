package org.example.planlist.dto.FriendDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
public class FriendListResponseDTO {
    private List<FriendDTO> friends;
    private List<FriendrequestDTO> friendRequest;

    public FriendListResponseDTO() {
    }

    public FriendListResponseDTO(List<FriendDTO> friends, List<FriendrequestDTO> friendRequest) {
        this.friends = friends;
        this.friendRequest = friendRequest;
    }
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class FriendDTO {
    private String name;
    private String email;
    private String profileImage;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class FriendrequestDTO {
    private String name;
    private String email;
    private String profileImage;
}