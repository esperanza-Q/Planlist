package org.example.planlist.dto.ProfileDTO;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
public class ProjectRequestWrapperDTO {
    private ProfileDTO profile;
    private List<ProjectRequestDTO> projectRequest;
    //changes by seoyoung
    public ProjectRequestWrapperDTO() {
    }
    public ProjectRequestWrapperDTO(ProfileDTO profile, List<ProjectRequestDTO> projectRequest) {
        this.profile = profile;
        this.projectRequest = projectRequest;

        
    }
    //change end
}