package org.example.planlist.dto.PT.request;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PtCommentRequestDTO {
    private String content;
}
