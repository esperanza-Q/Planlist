package org.example.planlist.dto.PT.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AddSessionResponseDTO {
    private Long plannerId;
    private LocalDate startDate;
    private LocalDate endDate;

    public AddSessionResponseDTO(Long plannerId, LocalDate startDate, LocalDate endDate) {
        this.plannerId = plannerId;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
