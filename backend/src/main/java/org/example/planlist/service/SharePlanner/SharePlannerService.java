package org.example.planlist.service.SharePlanner;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.SharePlannerDTO.request.SelectTimeRequestDTO;
import org.example.planlist.dto.PtDTO.response.FreeTimeIntervalDTO;
import org.example.planlist.dto.SharePlannerDTO.response.SharedPlannerResponseDTO;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
import org.example.planlist.util.Interval;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class SharePlannerService {

    private final ProjectParticipantRepository projectParticipantRepository;
    private final FreeTimeCalendarRepository freeTimeCalendarRepository;
    private final PlannerProjectRepository plannerProjectRepository;
    private final PlannerSessionRepository plannerSessionRepository;
    private final PtSessionRepository ptSessionRepository;

    // ------------------------
    // 기존 PT 전용 메서드
    // ------------------------
    public SharedPlannerResponseDTO getSharedPlanner(Long plannerId) {
        Long projectId = plannerSessionRepository.findById(plannerId)
                .orElseThrow(() -> new EntityNotFoundException("세션을 찾을 수 없습니다."))
                .getProject()
                .getProjectId();

        PtSession ptSession = ptSessionRepository.findById(plannerId).orElseThrow();
        LocalDate startDate = ptSession.getStartWeekDay();
        LocalDate endDate = ptSession.getEndWeekDay();

        List<ProjectParticipant> participants = projectParticipantRepository.findByProject_ProjectIdAndResponse(
                projectId, ProjectParticipant.Response.ACCEPTED);
        List<Long> userIds = participants.stream().map(p -> p.getUser().getId()).toList();

        if (userIds.isEmpty()) {
            return new SharedPlannerResponseDTO(startDate + " ~ " + endDate, Collections.emptyList());
        }

        List<FreeTimeCalendar> freeTimes = freeTimeCalendarRepository.findByUserIdInAndAvailableDateBetween(
                userIds, startDate, endDate);

        return calculatePTIntervals(startDate, endDate, userIds, freeTimes);
    }

    @Transactional
    public PlannerSession updateSelectTime(Long plannerId, SelectTimeRequestDTO dto) {
        PtSession session = ptSessionRepository.findById(plannerId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid plannerId: " + plannerId));

        LocalDate date = LocalDate.parse(dto.getDate());
        LocalTime startTime = null;
        LocalTime endTime = null;

        if (Boolean.TRUE.equals(dto.getAllDay())) {
            startTime = LocalTime.of(0, 0);
            endTime = LocalTime.of(23, 59);
        } else {
            if (dto.getStart() != null) startTime = LocalTime.parse(dto.getStart());
            if (dto.getEnd() != null) endTime = LocalTime.parse(dto.getEnd());
        }

        session.setDate(date);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setIsFinalized(true);

        return ptSessionRepository.save(session);
    }

    // PT 교집합 계산 내부 메서드
    private SharedPlannerResponseDTO calculatePTIntervals(LocalDate startDate, LocalDate endDate,
                                                          List<Long> userIds, List<FreeTimeCalendar> freeTimes) {
        Map<LocalDate, List<FreeTimeCalendar>> freeTimesByDate = freeTimes.stream()
                .collect(Collectors.groupingBy(FreeTimeCalendar::getAvailableDate));

        List<FreeTimeIntervalDTO> allList = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<FreeTimeCalendar> dayFreeTimes = freeTimesByDate.getOrDefault(date, Collections.emptyList());

            Map<Long, List<Interval>> userIntervals = new HashMap<>();
            for (FreeTimeCalendar ft : dayFreeTimes) {
                Interval interval;
                if (Boolean.TRUE.equals(ft.getAllDay())) {
                    interval = new Interval(LocalTime.MIN, LocalTime.MAX);
                } else {
                    interval = new Interval(
                            LocalTime.of(ft.getAvailableStartHour(), ft.getAvailableStartMin()),
                            LocalTime.of(ft.getAvailableEndHour(), ft.getAvailableEndMin())
                    );
                }
                userIntervals.computeIfAbsent(ft.getUser().getId(), k -> new ArrayList<>()).add(interval);
            }

            int totalParticipants = userIds.size();
            List<Interval> allOverlap = intersectAll(userIntervals, totalParticipants);
            allList.addAll(intervalsToDTO(date, allOverlap));
        }

        return new SharedPlannerResponseDTO(startDate + " ~ " + endDate, allList);
    }

    private List<Interval> intersectAll(Map<Long, List<Interval>> userIntervals, int totalParticipants) {
        if (userIntervals.size() < totalParticipants) {
            return Collections.emptyList();
        }

        List<Interval> intersected = new ArrayList<>(userIntervals.values().iterator().next());

        for (List<Interval> intervals : userIntervals.values()) {
            intersected = intersectIntervalLists(intersected, intervals);
            if (intersected.isEmpty()) break;
        }
        return intersected;
    }

    private List<Interval> intersectIntervalLists(List<Interval> list1, List<Interval> list2) {
        List<Interval> result = new ArrayList<>();
        int i = 0, j = 0;

        list1.sort(Comparator.comparing(Interval::getStart));
        list2.sort(Comparator.comparing(Interval::getStart));

        while (i < list1.size() && j < list2.size()) {
            Interval a = list1.get(i);
            Interval b = list2.get(j);
            Interval intersection = a.intersect(b);

            if (intersection != null) {
                result.add(intersection);
            }

            if (a.getEnd().isBefore(b.getEnd())) {
                i++;
            } else {
                j++;
            }
        }
        return result;
    }

    private List<FreeTimeIntervalDTO> intervalsToDTO(LocalDate date, List<Interval> intervals) {
        if (intervals.isEmpty()) return Collections.emptyList();

        List<FreeTimeIntervalDTO> dtos = new ArrayList<>();
        for (Interval interval : intervals) {
            if (interval.getStart().equals(LocalTime.MIN) && interval.getEnd().equals(LocalTime.MAX)) {
                dtos.add(FreeTimeIntervalDTO.ofAllDay(date));
            } else {
                dtos.add(FreeTimeIntervalDTO.of(date, interval.getStart(), interval.getEnd()));
            }
        }
        return dtos;
    }

    // ------------------------
    // 여행 프로젝트 전용 메서드
    // ------------------------
    @Transactional(readOnly = true)
    public SharedPlannerResponseDTO getTravelSharedCalendar(Long projectId, LocalDate startDate, LocalDate endDate) {
        List<ProjectParticipant> participants = projectParticipantRepository
                .findByProject_ProjectIdAndResponse(projectId, ProjectParticipant.Response.ACCEPTED);
        List<Long> userIds = participants.stream()
                .map(p -> p.getUser().getId())
                .toList();

        if (userIds.isEmpty()) {
            return new SharedPlannerResponseDTO(
                    startDate + " ~ " + endDate,
                    Collections.emptyList()
            );
        }

        List<FreeTimeCalendar> allDayFreeTimes = freeTimeCalendarRepository
                .findByUserIdInAndAllDayTrueAndAvailableDateBetween(userIds, startDate, endDate);

        Map<LocalDate, Long> dateCountMap = allDayFreeTimes.stream()
                .collect(Collectors.groupingBy(FreeTimeCalendar::getAvailableDate, Collectors.counting()));

        List<FreeTimeIntervalDTO> allDayCommonList = dateCountMap.entrySet().stream()
                .filter(e -> e.getValue() == userIds.size())
                .map(e -> FreeTimeIntervalDTO.ofAllDay(e.getKey()))
                .sorted(Comparator.comparing(FreeTimeIntervalDTO::getDate))
                .toList();

        return new SharedPlannerResponseDTO(startDate + " ~ " + endDate, allDayCommonList);
    }

    @Transactional
    public void confirmTravelDate(Long projectId, LocalDate date) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        project.setStartDate(date);
        project.setEndDate(date);
        project.setStatus(PlannerProject.Status.INPROGRESS);

        plannerProjectRepository.save(project);
    }

    // 여행 날짜 확정
    @Transactional
    public void confirmTravelDateRange(Long projectId, LocalDate startDate, LocalDate endDate) {
        PlannerProject project = plannerProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        project.setStartDate(startDate);
        project.setEndDate(endDate);
        project.setStatus(PlannerProject.Status.INPROGRESS);

        plannerProjectRepository.save(project);
    }
}
