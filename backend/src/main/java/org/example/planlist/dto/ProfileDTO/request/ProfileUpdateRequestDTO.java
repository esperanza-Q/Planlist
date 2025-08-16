package org.example.planlist.dto.ProfileDTO.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProfileUpdateRequestDTO {
    private String name;
    private MultipartFile profileImage;
}
