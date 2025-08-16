package org.example.planlist.dto.ProfileDTO;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
public class ProjectRequestWrapperDTO {
    private ProfileDTO profile;
    private List<ProjectRequestDTO> projectRequest;
}