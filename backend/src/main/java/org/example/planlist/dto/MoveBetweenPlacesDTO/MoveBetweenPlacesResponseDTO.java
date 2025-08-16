package org.example.planlist.dto.MoveBetweenPlacesDTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveBetweenPlacesResponseDTO {
    private String transportation;
    private Long durationMin;
    private LocalDate travelDate;
}
