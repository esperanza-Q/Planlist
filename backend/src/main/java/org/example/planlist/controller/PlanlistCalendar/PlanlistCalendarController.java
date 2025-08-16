package org.example.planlist.controller.PlanlistCalendar;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PlanlistCalendarDTO.PlanlistCalendarDTO;
import org.example.planlist.service.PlanlistCalendar.PlanlistCalendarService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/planlistCalendar")
public class PlanlistCalendarController {

    private final PlanlistCalendarService planlistCalendarService;

    @GetMapping("/day")
    public ResponseEntity<List<PlanlistCalendarDTO>> getPlanlistByDay(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(
                planlistCalendarService.getPlanlistByDateRange(date, date)
        );
    }

    @GetMapping("/week")
    public ResponseEntity<List<PlanlistCalendarDTO>> getPlanlistByWeek(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok(
                planlistCalendarService.getPlanlistByDateRange(startDate, endDate)
        );
    }

    @GetMapping("/month")
    public ResponseEntity<List<PlanlistCalendarDTO>> getPlanlistByMonth(
            @RequestParam("mon") @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {

        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();

        return ResponseEntity.ok(
                planlistCalendarService.getPlanlistByDateRange(startDate, endDate)
        );
    }
}