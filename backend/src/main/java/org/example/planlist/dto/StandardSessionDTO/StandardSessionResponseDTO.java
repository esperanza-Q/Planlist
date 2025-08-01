package org.example.planlist.dto.StandardSessionDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.example.planlist.dto.PlannerSessionDTO.PlannerSessionResponseDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class StandardSessionResponseDTO extends PlannerSessionResponseDTO {

    private String address;
    private Float latitude;
    private Float longitude;
}
