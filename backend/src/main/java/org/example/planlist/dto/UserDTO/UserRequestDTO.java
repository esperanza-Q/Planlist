package org.example.planlist.dto.UserDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {

    // userId 필드는 DB에서 자동 생성

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "프로필 이미지는 필수입니다.")
    private String profileImage;

    @NotBlank(message = "유저 네임은 필수입니다.")
    private String name;
}
