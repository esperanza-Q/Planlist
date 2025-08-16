package org.example.planlist.dto.MeetingReferenceDTO.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentReplaceResponse {
    private String oldKey;
    private String newKey;
    private String newUrl;
}