package org.example.planlist.dto.MoveBetweenPlacesDTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveBetweenPlacesResponseDTO {
    private Long id;              // ← 필드명 id
    private String transportation;
    private Long durationMin;
    private LocalDate travelDate;
}
