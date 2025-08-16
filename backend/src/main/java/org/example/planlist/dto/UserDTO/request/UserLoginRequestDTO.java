package org.example.planlist.dto.UserDTO.request;

import lombok.Data;

//로그인 요청 DTO
@Data
public class UserLoginRequestDTO {
    private String email;
    private String password;
}
