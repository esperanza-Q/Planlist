package org.example.planlist.service.Sidebar;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.SidebarDTO.NextEventDTO;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.repository.PlannerSessionRepository;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

//@Service
//@RequiredArgsConstructor
//public class SidebarService {
//
//    private final PlannerSessionRepository plannerSessionRepository;
//
//    @Transactional(readOnly = true)
//    public NextEventDTO getNextEventToday() {
//        Long userId = SecurityUtil.getCurrentUser().getId();
//        LocalDate today = LocalDate.now();
//        LocalTime nowTime = LocalTime.now();
//
//        return plannerSessionRepository
//                .findNextSessionToday(userId, today, nowTime)
//                .map(session -> NextEventDTO.builder()
//                        .title(session.getTitle())
//                        .startTime(session.getStartTime())
//                        .endTime(session.getEndTime())
//                        .build()
//                )
//                .orElseGet(() -> NextEventDTO.builder()
//                        .title("다음 일정 없음")
//                        .startTime(null)
//                        .endTime(null)
//                        .build()
//                );
//    }
//}

@Service
@RequiredArgsConstructor
public class SidebarService {

    private final PlannerSessionRepository plannerSessionRepository;

    @Transactional(readOnly = true)
    public NextEventDTO getNextEventToday() {
        Long userId = SecurityUtil.getCurrentUser().getId();
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        List<String> statuses = Arrays.asList("INPROGRESS", "FINISHED");

        return plannerSessionRepository
                .findFirstByProjectParticipantsUserIdAndProjectParticipantsResponseAndDateAndStartTimeGreaterThanAndProjectStatusInAndIsFinalizedTrueOrderByStartTimeAsc(
                        userId, ProjectParticipant.Response.ACCEPTED, today, nowTime, statuses)
                .map(session -> NextEventDTO.builder()
                        .title(session.getTitle())
                        .startTime(session.getStartTime())
                        .endTime(session.getEndTime())
                        .category(session.getProject().getCategory()) // 추가
                        .build()
                )
                .orElseGet(() -> NextEventDTO.builder()
                        .title("다음 일정 없음")
                        .startTime(null)
                        .endTime(null)
                        .category(null)  // 추가
                        .build()
                );
    }
}