package org.example.planlist.dto.MeetingReferenceDTO;

import lombok.*;

import java.net.URL;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingReferenceResponseDTO {

    private String fileName;
    private URL fileURL;
    private String fileType;
    private LocalDateTime uploadedAt;
}
