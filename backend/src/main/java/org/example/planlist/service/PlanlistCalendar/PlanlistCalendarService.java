package org.example.planlist.service.PlanlistCalendar;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PlanlistCalendarDTO.PlanlistCalendarDTO;
import org.example.planlist.dto.PlanlistCalendarDTO.PlanlistProjectsDTO;
import org.example.planlist.entity.DatePlanner;
import org.example.planlist.entity.PlannerSession;
import org.example.planlist.repository.DatePlannerRepository;
import org.example.planlist.repository.PlannerSessionRepository;
import org.example.planlist.security.CustomUserDetails;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PlanlistCalendarService {

    private final PlannerSessionRepository plannerSessionRepository;
    private final DatePlannerRepository datePlannerRepository;

    @Transactional(readOnly = true)
    public List<PlanlistCalendarDTO> getPlanlistByDateRange(LocalDate startDate,
                                                            LocalDate endDate) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<String> allowedStatuses = Arrays.asList("INPROGRESS", "FINISHED");

        // 1️⃣ TRAVEL
        List<DatePlanner> travelSessions = datePlannerRepository
                .findTravelByUserAndDateRangeAndStatuses(userId, startDate, endDate, allowedStatuses);

        // 2️⃣ 일반 세션
        List<PlannerSession> normalSessions = plannerSessionRepository
                .findFinalizedByUserAndDateRangeAndStatuses(userId, startDate, endDate, allowedStatuses);

        // 날짜별 그룹핑
        Map<LocalDate, List<PlanlistProjectsDTO>> groupedMap = new HashMap<>();

        for (DatePlanner travel : travelSessions) {
            groupedMap.computeIfAbsent(travel.getDate(), k -> new ArrayList<>())
                    .add(PlanlistProjectsDTO.builder()
                            .projectId(travel.getProject().getProjectId())
                            .sessionId(travel.getCalendarId())
                            .category(travel.getProject().getCategory())
                            .title(travel.getProject().getProjectTitle())
                            .start(travel.getVisitTime() != null ? travel.getVisitTime().toLocalTime().toString() : null)
                            .build());
        }

        for (PlannerSession session : normalSessions) {
            groupedMap.computeIfAbsent(session.getDate(), k -> new ArrayList<>())
                    .add(PlanlistProjectsDTO.builder()
                            .projectId(session.getProject().getProjectId())
                            .sessionId(session.getId())
                            .category(session.getProject().getCategory())
                            .title(session.getTitle())
                            .start(session.getStartTime() != null ? session.getStartTime().toString() : null)
                            .end(session.getEndTime() != null ? session.getEndTime().toString() : null)
                            .build());
        }

        return groupedMap.entrySet().stream()
                .map(entry -> PlanlistCalendarDTO.builder()
                        .date(entry.getKey())
                        .planlistCalendar(entry.getValue())
                        .build())
                .sorted(Comparator.comparing(PlanlistCalendarDTO::getDate))
                .toList();
    }
}