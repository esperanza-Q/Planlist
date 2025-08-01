package org.example.planlist.dto.StandardSessionDTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.example.planlist.dto.PlannerSessionDTO.PlannerSessionRequestDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class StandardSessionRequestDTO extends PlannerSessionRequestDTO {

    @NotNull
    private String address;

    @NotNull
    private Float latitude;

    @NotNull
    private Float longitude;
}
