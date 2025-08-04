package org.example.planlist.dto.UserDTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

//회원가입 요청 DTO
@Data
public class UserSignupRequestDTO {
    @NotBlank(message = "이메일은 필수입니다.")
    @Size(min = 2)
    private String email;


    @Size(min = 8)
    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    @Size(min = 8)
    @NotBlank(message = "비밀번호확인은 필수입니다.")
    private String confirmPassword;

    private String profileImage;
}