package org.example.planlist.dto.UserDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor

public class UserResponseDTO {
    private String email;
    private String name;
    private String profileImage;
}
