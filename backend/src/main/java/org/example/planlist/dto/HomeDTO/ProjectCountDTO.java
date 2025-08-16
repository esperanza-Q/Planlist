package org.example.planlist.dto.HomeDTO;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Builder
@Data
public class ProjectCountDTO {
    private Integer upcoming;
    private Integer inProgress;
    private Integer finished;
}