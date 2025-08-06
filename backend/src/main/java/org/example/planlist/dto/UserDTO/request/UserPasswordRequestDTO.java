package org.example.planlist.dto.UserDTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserPasswordRequestDTO {
    @Size(min = 8)
    @NotBlank(message = "현재 비밀번호는 필수입니다.")
    private String currentPassword;

    @Size(min = 8)
    @NotBlank(message = "새로운 비밀번호는 필수입니다.")
    private String newPassword;

    @Size(min = 8)
    @NotBlank(message = "확인용 비밀번호는 필수입니다.")
    private String confirmPassword;
}