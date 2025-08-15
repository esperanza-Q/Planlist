package org.example.planlist.dto.MeetingReferenceDTO.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class DocumentDeleteRequest {
    @NotBlank
    private String urlOrKey; // URL 또는 key
}