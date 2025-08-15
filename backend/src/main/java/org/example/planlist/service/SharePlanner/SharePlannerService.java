package org.example.planlist.service.SharePlanner;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.SharePlannerDTO.request.SelectTimeRequestDTO;
import org.example.planlist.dto.PtDTO.response.FreeTimeIntervalDTO;
import org.example.planlist.dto.SharePlannerDTO.response.SharedPlannerResponseDTO;
import org.example.planlist.dto.TravelDTO.Response.TravelInviteeFreeTimeResponseDTO;
import org.example.planlist.entity.*;
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
    public PlannerSession updateSelectTime(Long plannerId, SelectTimeRequestDTO dto) {
        // 1. 기존 세션 찾기
        PtSession session = ptSessionRepository.findById(plannerId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid plannerId: " + plannerId));

        // 2. 날짜/시간 파싱
        LocalDate date = LocalDate.parse(dto.getDate());
        LocalTime startTime;
        LocalTime endTime;

        if (Boolean.TRUE.equals(dto.getAllDay())) {
            startTime = LocalTime.MIN;
            endTime = LocalTime.MAX;
        } else {
            startTime = dto.getStart() != null ? LocalTime.parse(dto.getStart()) : null;
            endTime = dto.getEnd() != null ? LocalTime.parse(dto.getEnd()) : null;
        }

        // 3. 세션 값 업데이트
        session.setDate(date);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setIsFinalized(true);

        // 4. 프로젝트 참가자 FreeTimeCalendar 조정
        PlannerProject project = session.getProject();
        for (ProjectParticipant participant : project.getParticipants()) {
            User user = participant.getUser();
            List<FreeTimeCalendar> freeTimes = freeTimeCalendarRepository.findByUserAndAvailableDate(user, date);

            for (FreeTimeCalendar freeTime : freeTimes) {
                LocalTime freeStart;
                LocalTime freeEnd;

                // allDay 처리
                if (Boolean.TRUE.equals(freeTime.getAllDay())) {
                    freeStart = LocalTime.MIN;
                    freeEnd = LocalTime.MAX;
                } else {
                    int startHour = Optional.ofNullable(freeTime.getAvailableStartHour()).orElse(0);
                    int startMin = Optional.ofNullable(freeTime.getAvailableStartMin()).orElse(0);
                    int endHour = Optional.ofNullable(freeTime.getAvailableEndHour()).orElse(23);
                    int endMin = Optional.ofNullable(freeTime.getAvailableEndMin()).orElse(59);

                    freeStart = LocalTime.of(startHour, startMin);
                    freeEnd = LocalTime.of(endHour, endMin);
                }

                // 겹치는 경우만 처리
                if (!freeEnd.isBefore(startTime) && !freeStart.isAfter(endTime)) {

                    // (1) 완전히 덮힘 → 삭제
                    if (!freeStart.isBefore(startTime) && !freeEnd.isAfter(endTime)) {
                        freeTimeCalendarRepository.delete(freeTime);
                    }

                    // (2) 앞/뒤 모두 남음 → 분할
                    else if (freeStart.isBefore(startTime) && freeEnd.isAfter(endTime)) {
                        // 앞쪽 수정
                        freeTime.setAvailableStartHour(freeStart.getHour());
                        freeTime.setAvailableStartMin(freeStart.getMinute());
                        freeTime.setAvailableEndHour(startTime.getHour());
                        freeTime.setAvailableEndMin(startTime.getMinute());
                        freeTime.setAllDay(false);
                        freeTimeCalendarRepository.save(freeTime);

                        // 뒤쪽 새 객체 추가
                        FreeTimeCalendar newFreeTime = FreeTimeCalendar.builder()
                                .user(user)
                                .availableDate(date)
                                .allDay(false)
                                .availableStartHour(endTime.getHour())
                                .availableStartMin(endTime.getMinute())
                                .availableEndHour(freeEnd.getHour())
                                .availableEndMin(freeEnd.getMinute())
                                .build();
                        freeTimeCalendarRepository.save(newFreeTime);
                    }

                    // (3) 앞쪽만 남음 → 끝 시간 줄임
                    else if (freeStart.isBefore(startTime)) {
                        freeTime.setAvailableStartHour(freeStart.getHour());
                        freeTime.setAvailableStartMin(freeStart.getMinute());
                        freeTime.setAvailableEndHour(startTime.getHour());
                        freeTime.setAvailableEndMin(startTime.getMinute());
                        freeTime.setAllDay(false);
                        freeTimeCalendarRepository.save(freeTime);
                    }

                    // (4) 뒤쪽만 남음 → 시작 시간 당김
                    else if (freeEnd.isAfter(endTime)) {
                        freeTime.setAvailableStartHour(endTime.getHour());
                        freeTime.setAvailableStartMin(endTime.getMinute());
                        freeTime.setAvailableEndHour(freeEnd.getHour());
                        freeTime.setAvailableEndMin(freeEnd.getMinute());
                        freeTime.setAllDay(false);
                        freeTimeCalendarRepository.save(freeTime);
                    }
                }
            }
        }

        // 5. 프로젝트 startDate / endDate 재계산
        List<PtSession> allSessions = ptSessionRepository.findByProject(project);

        LocalDate minDate = allSessions.stream()
                .filter(PtSession::getIsFinalized)
                .map(PtSession::getDate)
                .min(LocalDate::compareTo)
                .orElse(null);

        LocalDate maxDate = allSessions.stream()
                .filter(PtSession::getIsFinalized)
                .map(PtSession::getDate)
                .max(LocalDate::compareTo)
                .orElse(null);

        project.setStartDate(minDate);
        project.setEndDate(maxDate);
        plannerProjectRepository.save(project);

        // 6. 세션 저장 후 반환
        return ptSessionRepository.save(session);
    }
}