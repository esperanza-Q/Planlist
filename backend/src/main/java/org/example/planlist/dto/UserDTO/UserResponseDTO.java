package org.example.planlist.dto.UserDTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {

    private String email;
    private String profileImage;
    private String name;
}
