// package org.example.planlist.dto.ProfileDTO;


// import com.fasterxml.jackson.annotation.JsonProperty;
// import lombok.*;

// @Getter @Setter
// @NoArgsConstructor @AllArgsConstructor
// public class ProjectRequestDTO {

//     @JsonProperty("invitee_id") // serialize as "invitee_id"
//     private Long inviteeId;

//     private String projectTitle;
//     private String creator;
// }

//changes by seoyoung
package org.example.planlist.dto.ProfileDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequestDTO {
    private Long inviteeId;     // maps to pp.id
    private String projectTitle; // maps to p.projectTitle
    private String creator;      // maps to c.name
}
