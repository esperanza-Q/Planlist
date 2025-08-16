package org.example.planlist.dto.ProfileDTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProfileDTO {
    private String name;
    private String email;

    @JsonProperty("profile_image")
    private String profileImage;
}
