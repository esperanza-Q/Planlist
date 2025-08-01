package org.example.planlist.mapper;

import org.example.planlist.dto.UserDTO.UserRequestDTO;
import org.example.planlist.dto.UserDTO.UserResponseDTO;
import org.example.planlist.entity.User;

public class UserMapper {

    public static User toEntity(UserRequestDTO dto) {
        return User.builder()
                .email(dto.getEmail())
                .profileImage(dto.getProfileImage())
                .name(dto.getName())
                .build();
    }

    public static UserResponseDTO toResponseDTO(User entity) {
        return UserResponseDTO.builder()
//                .userId(entity.getId())
                .email(entity.getEmail())
                .profileImage(entity.getProfileImage())
                .name(entity.getName())
                .build();
    }
}
