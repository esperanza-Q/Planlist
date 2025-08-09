package org.example.planlist.controller.Home;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.FreeTimeCalendarDTO.response.FreeTimeResponseDTO;
import org.example.planlist.dto.HomeDTO.HomeResponseDTO;
import org.example.planlist.entity.User;
import org.example.planlist.security.SecurityUtil;
import org.example.planlist.service.Home.HomeService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
class HomeController {

    private final HomeService homeService;

    // 홈 전체
    @GetMapping("")
    public ResponseEntity<HomeResponseDTO> getHome() {
        User currentUser = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(homeService.getHomePage(currentUser));
    }

    // 월 단위 프리타임 조회
    @GetMapping("/free-time")
    public ResponseEntity<List<FreeTimeResponseDTO>> getFreeTimeByMonth(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        User currentUser = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(homeService.getFreeTimeInRange(currentUser, startDate, endDate));
    }
}
