package org.example.planlist.service.Home;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.FreeTimeCalendarDTO.response.FreeTimeResponseDTO;
import org.example.planlist.dto.HomeDTO.HomeResponseDTO;
import org.example.planlist.dto.HomeDTO.ProjectCountDTO;
import org.example.planlist.dto.HomeDTO.ProjectOverviewDTO;
import org.example.planlist.entity.FreeTimeCalendar;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.ProjectCount;
import org.example.planlist.entity.User;
import org.example.planlist.repository.FreeTimeCalendarRepository;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.ProjectCountRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final ProjectCountRepository projectCountRepository;
    private final FreeTimeCalendarRepository freeTimeCalendarRepository;
    private final PlannerProjectRepository plannerProjectRepository;

    // 홈 진입 시 전체 데이터
    public HomeResponseDTO getHomePage(User user) {

        // 프로젝트 수
        ProjectCount count = projectCountRepository.findByUser(user)
                .orElse(ProjectCount.builder().upComing(0).inProgress(0).finished(0).build());

        ProjectCountDTO countDTO = ProjectCountDTO.builder()
                .upcoming(count.getUpComing())
                .inProgress(count.getInProgress())
                .finished(count.getFinished())
                .build();

        // 이번 주 프리타임
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        List<FreeTimeResponseDTO> freeTimeDTOs = getFreeTimeInRange(user, startOfMonth, endOfMonth);

        // 프로젝트 개요 (INPROGRESS만)
        List<PlannerProject> projects = plannerProjectRepository.findByCreatorAndStatus(user, PlannerProject.Status.INPROGRESS);

        List<ProjectOverviewDTO> overviewDTOs = projects.stream()
                .map(p -> {
                    LocalDate startDate = p.getStartDate();
                    LocalDate endDate = p.getEndDate();

                    String duration;
                    int days;

                    if (startDate != null && endDate != null) {
                        duration = String.format("%02d/%02d~%02d/%02d",
                                startDate.getMonthValue(), startDate.getDayOfMonth(),
                                endDate.getMonthValue(), endDate.getDayOfMonth());

                        days = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
                    } else {
                        duration = "기간 정보 없음";
                        days = 0;
                    }

                    return ProjectOverviewDTO.builder()
                            .projectTitle(p.getProjectTitle())
                            .category(p.getCategory().name())
                            .status(p.getStatus().name())
                            .duration(duration)
                            .days(days)
                            .build();
                }).toList();

        return HomeResponseDTO.builder()
                .projectCount(countDTO)
                .freeTimeCalendar(freeTimeDTOs)
                .projectOverview(overviewDTOs)
                .build();
    }

    // ✅ 특정 기간 프리타임 조회 (월 또는 일 단위)
    public List<FreeTimeResponseDTO> getFreeTimeInRange(User user, LocalDate startDate, LocalDate endDate) {
        List<FreeTimeCalendar> freeTimes = freeTimeCalendarRepository
                .findAllByUserAndAvailableDateBetween(user, startDate, endDate);

        return freeTimes.stream()
                .map(freeTime -> {
                    boolean allDay = Boolean.TRUE.equals(freeTime.getAll_day());

                    if (allDay) {
                        return FreeTimeResponseDTO.builder()
                                .date(freeTime.getAvailableDate().toString())
                                .allDay(true)
                                .build();
                    } else {
                        String start = String.format("%02d:%02d",
                                freeTime.getAvailableStartHour(), freeTime.getAvailableStartMin());
                        String end = String.format("%02d:%02d",
                                freeTime.getAvailableEndHour(), freeTime.getAvailableEndMin());

                        return FreeTimeResponseDTO.builder()
                                .date(freeTime.getAvailableDate().toString())
                                .start(start)
                                .end(end)
                                .allDay(false)
                                .build();
                    }
                })
                .sorted(Comparator
                        .comparing(FreeTimeResponseDTO::getDate)
                        .thenComparing(dto -> {
                            if (Boolean.TRUE.equals(dto.getAllDay())) return LocalTime.MIN;
                            return LocalTime.parse(dto.getStart());
                        }))
                .toList();
    }
}