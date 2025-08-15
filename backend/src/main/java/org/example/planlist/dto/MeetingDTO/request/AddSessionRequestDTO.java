package org.example.planlist.dto.MeetingDTO.request;

import lombok.Data;
import org.example.planlist.entity.MeetingSession;

import java.time.LocalDate;

@Data
public class AddSessionRequestDTO {
    private Long projectId;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;

    private Boolean isRecurring;
    private MeetingSession.RecurrenceUnit recurrenceUnit;
    private Integer recurrenceCount;
}
