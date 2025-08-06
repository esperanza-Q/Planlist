package org.example.planlist.dto.MeetingReferenceDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.net.URL;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingReferenceRequestDTO {

    @NotNull
    private Long plannerId;

    @NotBlank
    private String fileName;

    @NotNull
    private URL fileURL;

    @NotNull
    private String fileType;

    @NotNull
    private LocalDateTime uploadedAt;
}
