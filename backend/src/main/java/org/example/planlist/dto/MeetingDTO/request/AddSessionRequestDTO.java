package org.example.planlist.dto.MeetingDTO.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AddSessionRequestDTO {
    private Long projectId;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
}
