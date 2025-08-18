package org.example.planlist.dto.FriendDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendrequestResponseDTO {
    private String name;
    private String email;
    private String profileImage;
}
