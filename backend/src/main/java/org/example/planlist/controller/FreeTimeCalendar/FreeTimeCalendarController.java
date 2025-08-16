package org.example.planlist.controller.FreeTimeCalendar;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.FreeTimeCalendarDTO.request.FreeTimeRequestDTO;
import org.example.planlist.dto.FreeTimeCalendarDTO.response.FreeTimeWeekResponseDTO;
import org.example.planlist.entity.User;
import org.example.planlist.security.SecurityUtil;
import org.example.planlist.service.FreeTimeCalendar.FreeTimeCalendarService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home/freeTimeCalendar")
public class FreeTimeCalendarController {

    private final FreeTimeCalendarService freeTimeCalendarService;

    @PostMapping("/updateFreeTime")
    public ResponseEntity<String> updateFreeTime(@RequestBody FreeTimeRequestDTO requestDTO) {
        User currentUser = SecurityUtil.getCurrentUser();
        freeTimeCalendarService.updateFreeTime(requestDTO, currentUser);
        return ResponseEntity.ok("Free time updated successfully.");
    }

    @GetMapping("/getFreeTime")
    public ResponseEntity<FreeTimeWeekResponseDTO> getFreeTime(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User currentUser = SecurityUtil.getCurrentUser();
        FreeTimeWeekResponseDTO response = freeTimeCalendarService.getFreeTimeBetweenDates(currentUser, startDate, endDate);
        return ResponseEntity.ok(response);
    }
}
