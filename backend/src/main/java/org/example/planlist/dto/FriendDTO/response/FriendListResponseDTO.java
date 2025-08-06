package org.example.planlist.dto.FriendDTO.response;

import lombok.Data;

import java.util.List;

@Data
public class FriendListResponseDTO {
    private List<FriendResponseDTO> friends;
    private List<FriendrequestResponseDTO> friendRequest;

    public FriendListResponseDTO() {
    }

    public FriendListResponseDTO(List<FriendResponseDTO> friends, List<FriendrequestResponseDTO> friendRequest) {
        this.friends = friends;
        this.friendRequest = friendRequest;
    }
}

