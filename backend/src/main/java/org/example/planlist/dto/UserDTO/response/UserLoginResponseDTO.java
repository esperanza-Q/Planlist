package org.example.planlist.dto.UserDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;

//로그인 응답 DTO
@Data
@AllArgsConstructor
public class UserLoginResponseDTO {
    private String userId;
    private String token;
}