package org.example.planlist.dto.PtDTO.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class FreeTimeIntervalDTO {
    private String date;
    private String start; // "HH:mm" (allDay인 경우 null)
    private String end;   // "HH:mm" (allDay인 경우 null)
    private Boolean allDay;

    // allDay인 경우 생성용 정적 팩토리
    public static FreeTimeIntervalDTO ofAllDay(LocalDate date) {
        return new FreeTimeIntervalDTO(date.toString(), null, null, true);
    }

    // 시간 구간 생성용
    public static FreeTimeIntervalDTO of(LocalDate date, LocalTime start, LocalTime end) {
        return new FreeTimeIntervalDTO(date.toString(), start.toString(), end.toString(), false);
    }
}
