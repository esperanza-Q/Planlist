package org.example.planlist.dto.StandardDTO.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectInfoDTO {
    private Long projectId;
    private String projectName;
    private String category;
}
