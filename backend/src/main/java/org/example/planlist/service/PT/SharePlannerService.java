package org.example.planlist.service.PT;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PT.request.SelectTimeRequestDTO;
import org.example.planlist.dto.PT.response.FreeTimeIntervalDTO;
import org.example.planlist.dto.PT.response.PtSessionDTO;
import org.example.planlist.dto.PT.response.SharedPlannerResponseDTO;
import org.example.planlist.entity.FreeTimeCalendar;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.PtSession;
import org.example.planlist.repository.*;
import org.example.planlist.util.Interval;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SharePlannerService {

    private final ProjectParticipantRepository projectParticipantRepository;
    private final FreeTimeCalendarRepository freeTimeCalendarRepository;
    private final PtSessionRepository ptSessionRepository;
    private final PlannerSessionRepository plannerSessionRepository;
    private final PlannerProjectRepository plannerProjectRepository;

    public SharedPlannerResponseDTO getSharedPlanner(Long plannerId) {

        Long projectId = plannerSessionRepository.findById(plannerId)
                .orElseThrow(() -> new EntityNotFoundException("세션을 찾을 수 없습니다."))
                .getProject()
                .getProjectId();

        PtSession ptSession = ptSessionRepository.findById(plannerId).orElseThrow();

        LocalDate startDate = ptSession.getStartWeekDay();
        LocalDate endDate = ptSession.getEndWeekDay();

        // 1. ACCEPTED 참여자 조회
        List<ProjectParticipant> participants = projectParticipantRepository.findByProject_ProjectIdAndResponse(
                projectId, ProjectParticipant.Response.ACCEPTED);
        List<Long> userIds = participants.stream()
                .map(p -> p.getUser().getId())
                .collect(Collectors.toList());

        if (userIds.isEmpty()) {
            return new SharedPlannerResponseDTO(
                    startDate + " ~ " + endDate,
                    Collections.emptyList()
//                    Collections.emptyList()
            );
        }

        // 2. 참여자 프리캘린더 조회
        List<FreeTimeCalendar> freeTimes = freeTimeCalendarRepository.findByUserIdInAndAvailableDateBetween(
                userIds, startDate, endDate);

        // 3. 날짜별로 그룹핑
        Map<LocalDate, List<FreeTimeCalendar>> freeTimesByDate = freeTimes.stream()
                .collect(Collectors.groupingBy(FreeTimeCalendar::getAvailableDate));

        List<FreeTimeIntervalDTO> allList = new ArrayList<>();
//        List<FreeTimeIntervalDTO> notOneList = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<FreeTimeCalendar> dayFreeTimes = freeTimesByDate.getOrDefault(date, Collections.emptyList());

            // userId -> List<Interval>
            Map<Long, List<Interval>> userIntervals = new HashMap<>();
            for (FreeTimeCalendar ft : dayFreeTimes) {
                Interval interval;
                if (Boolean.TRUE.equals(ft.getAll_day())) {
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

            // 모두 겹치는 구간
            List<Interval> allOverlap = intersectAll(userIntervals, totalParticipants);

            // 한명 뺀 나머지 겹치는 구간
//            List<Interval> notOneOverlap = intersectNotOne(userIntervals);
//
            allList.addAll(intervalsToDTO(date, allOverlap));
//            notOneList.addAll(intervalsToDTO(date, notOneOverlap));
        }

        return new SharedPlannerResponseDTO(
                startDate + " ~ " + endDate,
                allList
//                notOneList
        );
    }

    // 모든 참여자의 interval 리스트 교집합 계산
    private List<Interval> intersectAll(Map<Long, List<Interval>> userIntervals, int totalParticipants) {
        if (userIntervals.size() < totalParticipants) {
            // 여유시간 없는 참여자 존재 → 교집합 없음
            return Collections.emptyList();
        }

        // 시작값으로 첫 참여자 interval 복사
        List<Interval> intersected = new ArrayList<>(userIntervals.values().iterator().next());

        // 모든 참여자의 interval 교집합 계산
        for (List<Interval> intervals : userIntervals.values()) {
            intersected = intersectIntervalLists(intersected, intervals);
            if (intersected.isEmpty()) break;
        }
        return intersected;
    }

    // n명 중 한 명 제외 후 나머지 모두의 교집합 (각 멤버 제외하고 교집합 구해서 모두 합침)
    private List<Interval> intersectNotOne(Map<Long, List<Interval>> userIntervals) {
        List<Interval> result = new ArrayList<>();
        List<Long> users = new ArrayList<>(userIntervals.keySet());

        for (int i = 0; i < users.size(); i++) {
            Long excludedUser = users.get(i);

            // 제외한 나머지 참여자들의 intervals만 추림
            Map<Long, List<Interval>> subMap = new HashMap<>(userIntervals);
            subMap.remove(excludedUser);

            if (subMap.isEmpty()) continue;

            // 교집합 계산
            List<Interval> intersected = new ArrayList<>(subMap.values().iterator().next());
            for (List<Interval> intervals : subMap.values()) {
                intersected = intersectIntervalLists(intersected, intervals);
                if (intersected.isEmpty()) break;
            }
            result = unionIntervals(result, intersected);
        }

        return result;
    }

    // 두 interval 리스트의 교집합 계산
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

    // 두 interval 리스트의 합집합 계산 (중첩 구간 합침)
    private List<Interval> unionIntervals(List<Interval> list1, List<Interval> list2) {
        List<Interval> combined = new ArrayList<>();
        combined.addAll(list1);
        combined.addAll(list2);
        if (combined.isEmpty()) return combined;

        combined.sort(Comparator.comparing(Interval::getStart));
        List<Interval> merged = new ArrayList<>();
        Interval prev = combined.get(0);

        for (int i = 1; i < combined.size(); i++) {
            Interval curr = combined.get(i);
            if (!prev.getEnd().isBefore(curr.getStart())) {
                // 겹치는 구간 병합
                prev = new Interval(prev.getStart(), prev.getEnd().isAfter(curr.getEnd()) ? prev.getEnd() : curr.getEnd());
            } else {
                merged.add(prev);
                prev = curr;
            }
        }
        merged.add(prev);
        return merged;
    }

    private List<FreeTimeIntervalDTO> intervalsToDTO(LocalDate date, List<Interval> intervals) {
        if (intervals.isEmpty()) return Collections.emptyList();

        List<FreeTimeIntervalDTO> dtos = new ArrayList<>();
        for (Interval interval : intervals) {
            // 00:00 ~ 23:59:59 인 경우 allDay 처리
            if (interval.getStart().equals(LocalTime.MIN) && interval.getEnd().equals(LocalTime.MAX)) {
                dtos.add(FreeTimeIntervalDTO.ofAllDay(date));
            } else {
                dtos.add(FreeTimeIntervalDTO.of(date, interval.getStart(), interval.getEnd()));
            }
        }
        return dtos;
    }

    @Transactional
    public PtSession updateSelectTime(Long plannerId, SelectTimeRequestDTO dto) {
        // 기존 세션 찾기
        PtSession session = ptSessionRepository.findById(plannerId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid plannerId: " + plannerId));

        // 날짜 파싱
        LocalDate date = LocalDate.parse(dto.getDate());
        LocalTime startTime = null;
        LocalTime endTime = null;

        // allDay 여부에 따라 시간 설정
        if (dto.getAllDay() != null && dto.getAllDay()) {
            startTime = LocalTime.of(0, 0);
            endTime = LocalTime.of(23, 59);
        } else {
            if (dto.getStart() != null) {
                startTime = LocalTime.parse(dto.getStart());
            }
            if (dto.getEnd() != null) {
                endTime = LocalTime.parse(dto.getEnd());
            }
        }

        // 값 업데이트
        session.setDate(date);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setIsFinalized(true);

        // 저장
        return ptSessionRepository.save(session);
    }
}
