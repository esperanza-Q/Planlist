package org.example.planlist.service.FreeTimeCalendar;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.FreeTimeCalendarDTO.FreeTimeDTO;
import org.example.planlist.dto.FreeTimeCalendarDTO.request.FreeTimeRequestDTO;
import org.example.planlist.dto.FreeTimeCalendarDTO.response.FreeTimeResponseDTO;
import org.example.planlist.dto.FreeTimeCalendarDTO.response.FreeTimeWeekResponseDTO;
import org.example.planlist.entity.FreeTimeCalendar;
import org.example.planlist.entity.User;
import org.example.planlist.repository.FreeTimeCalendarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

//@Service
//@RequiredArgsConstructor
//public class FreeTimeCalendarService {
//
//    private final FreeTimeCalendarRepository freeTimeCalendarRepository;
//
//    @Transactional
//    public void updateFreeTime(FreeTimeRequestDTO requestDTO, User user) {
//        deleteUserFreeTime(user); // ✅ 기존 데이터 초기화
//        saveFreeTimeList(requestDTO.getFreeTimeCalendar(), user); // ✅ 새 데이터 저장
//    }
//
//    /**
//     * 기존 자유시간 전부 삭제
//     */
//    private void deleteUserFreeTime(User user) {
//        freeTimeCalendarRepository.deleteAllByUser(user);
//    }
//
//    /**
//     * 새로운 자유시간 저장
//     */
//    private void saveFreeTimeList(List<FreeTimeDTO> freeTimeList, User user) {
//        for (FreeTimeDTO dto : freeTimeList) {
//            LocalDate date = LocalDate.parse(dto.getDate());
//            boolean allDay = Boolean.TRUE.equals(dto.getAllDay());
//
//            Integer startHour = null, startMin = null, endHour = null, endMin = null;
//
//            if (!allDay && dto.getStart() != null && dto.getEnd() != null) {
//                String[] startSplit = dto.getStart().split(":");
//                String[] endSplit = dto.getEnd().split(":");
//
//                startHour = Integer.parseInt(startSplit[0]);
//                startMin = Integer.parseInt(startSplit[1]);
//                endHour = Integer.parseInt(endSplit[0]);
//                endMin = Integer.parseInt(endSplit[1]);
//            }
//
//            FreeTimeCalendar freeTime = FreeTimeCalendar.builder()
//                    .user(user)
//                    .availableDate(date)
//                    .allDay(allDay)
//                    .availableStartHour(startHour)
//                    .availableStartMin(startMin)
//                    .availableEndHour(endHour)
//                    .availableEndMin(endMin)
//                    .build();
//
//            freeTimeCalendarRepository.save(freeTime);
//        }
//    }
//
//
//    @Transactional(readOnly = true)
//    public FreeTimeWeekResponseDTO getFreeTimeBetweenDates(User user, LocalDate startDate, LocalDate endDate) {
//        List<FreeTimeCalendar> freeTimes = freeTimeCalendarRepository
//                .findAllByUserAndAvailableDateBetween(user, startDate, endDate);
//
//        List<FreeTimeResponseDTO> responseList = freeTimes.stream()
//                .map(freeTime -> {
//                    if (Boolean.TRUE.equals(freeTime.getAllDay())) {
//                        return FreeTimeResponseDTO.builder()
//                                .date(freeTime.getAvailableDate().toString())
//                                .allDay(true)
//                                .build();
//                    } else {
//                        String start = String.format("%02d:%02d",
//                                freeTime.getAvailableStartHour(), freeTime.getAvailableStartMin());
//                        String end = String.format("%02d:%02d",
//                                freeTime.getAvailableEndHour(), freeTime.getAvailableEndMin());
//
//                        return FreeTimeResponseDTO.builder()
//                                .date(freeTime.getAvailableDate().toString())
//                                .start(start)
//                                .end(end)
//                                .build();
//                    }
//                })
//                .sorted(Comparator
//                        .comparing(FreeTimeResponseDTO::getDate)
//                        .thenComparing(dto -> {
//                            if (dto.getAllDay() != null && dto.getAllDay()) {
//                                return LocalTime.MIN; // 하루종일은 가장 먼저
//                            } else {
//                                return LocalTime.parse(dto.getStart());
//                            }
//                        })
//                )
//                .toList();
//
//        String weekRange = startDate.toString() + " ~ " + endDate.toString();
//
//        return FreeTimeWeekResponseDTO.builder()
//                .week(weekRange)
//                .freeTimeCalendar(responseList)
//                .build();
//    }
//}

@Service
@RequiredArgsConstructor
public class FreeTimeCalendarService {

    private final FreeTimeCalendarRepository freeTimeCalendarRepository;

    @Transactional
    public void updateFreeTime(FreeTimeRequestDTO requestDTO, User user) {
        // 요청 주 범위 계산
        if (requestDTO.getFreeTimeCalendar() == null || requestDTO.getFreeTimeCalendar().isEmpty()) {
            throw new IllegalArgumentException("freeTimeCalendar is empty");
        }

        LocalDate firstDate = LocalDate.parse(requestDTO.getFreeTimeCalendar().get(0).getDate());
        LocalDate startOfWeek = firstDate.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = firstDate.with(DayOfWeek.SUNDAY);

        // 해당 주의 데이터 전부 삭제
        freeTimeCalendarRepository.deleteAllByUserAndAvailableDateBetween(user, startOfWeek, endOfWeek);

        // 요청 데이터 저장
        saveFreeTimeList(requestDTO.getFreeTimeCalendar(), user);
    }

    /**
     * 기존 자유시간 중 요청 날짜들만 삭제
     */
//    private void deleteUserFreeTime(User user, List<FreeTimeDTO> freeTimeList) {
//        List<LocalDate> dates = freeTimeList.stream()
//                .map(dto -> LocalDate.parse(dto.getDate()))
//                .toList();
//        freeTimeCalendarRepository.deleteAllByUserAndAvailableDateIn(user, dates);
//    }

    private void deleteUserFreeTime(User user, List<FreeTimeDTO> freeTimeList) {
        List<LocalDate> requestDates = freeTimeList.stream()
                .map(dto -> LocalDate.parse(dto.getDate()))
                .toList();

        // 요청 범위 계산 (예: 최소~최대 날짜)
        LocalDate minDate = requestDates.stream().min(LocalDate::compareTo).orElse(null);
        LocalDate maxDate = requestDates.stream().max(LocalDate::compareTo).orElse(null);

        if (minDate != null && maxDate != null) {
            List<FreeTimeCalendar> existing = freeTimeCalendarRepository
                    .findAllByUserAndAvailableDateBetween(user, minDate, maxDate);

            // 요청에 없는 날짜는 삭제
            List<LocalDate> datesToDelete = existing.stream()
                    .map(FreeTimeCalendar::getAvailableDate)
                    .filter(date -> !requestDates.contains(date))
                    .toList();

            if (!datesToDelete.isEmpty()) {
                freeTimeCalendarRepository.deleteAllByUserAndAvailableDateIn(user, datesToDelete);
            }
        }

        // 요청 날짜는 기존 데이터 지움
        if (!requestDates.isEmpty()) {
            freeTimeCalendarRepository.deleteAllByUserAndAvailableDateIn(user, requestDates);
        }
    }

    /**
     * 새로운 자유시간 저장
     */
    private void saveFreeTimeList(List<FreeTimeDTO> freeTimeList, User user) {
        for (FreeTimeDTO dto : freeTimeList) {
            LocalDate date = LocalDate.parse(dto.getDate());
            boolean allDay = Boolean.TRUE.equals(dto.getAllDay());

            Integer startHour = null, startMin = null, endHour = null, endMin = null;

            if (!allDay && dto.getStart() != null && dto.getEnd() != null) {
                String[] startSplit = dto.getStart().split(":");
                String[] endSplit = dto.getEnd().split(":");

                startHour = Integer.parseInt(startSplit[0]);
                startMin = Integer.parseInt(startSplit[1]);
                endHour = Integer.parseInt(endSplit[0]);
                endMin = Integer.parseInt(endSplit[1]);
            }

            FreeTimeCalendar freeTime = FreeTimeCalendar.builder()
                    .user(user)
                    .availableDate(date)
                    .allDay(allDay)
                    .availableStartHour(startHour)
                    .availableStartMin(startMin)
                    .availableEndHour(endHour)
                    .availableEndMin(endMin)
                    .build();

            freeTimeCalendarRepository.save(freeTime);
        }
    }

    @Transactional(readOnly = true)
    public FreeTimeWeekResponseDTO getFreeTimeBetweenDates(User user, LocalDate startDate, LocalDate endDate) {
        List<FreeTimeCalendar> freeTimes = freeTimeCalendarRepository
                .findAllByUserAndAvailableDateBetween(user, startDate, endDate);

        List<FreeTimeResponseDTO> responseList = freeTimes.stream()
                .map(freeTime -> {
                    if (Boolean.TRUE.equals(freeTime.getAllDay())) {
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
                                .build();
                    }
                })
                .sorted(Comparator
                        .comparing(FreeTimeResponseDTO::getDate)
                        .thenComparing(dto -> {
                            if (dto.getAllDay() != null && dto.getAllDay()) {
                                return LocalTime.MIN; // 하루종일은 가장 먼저
                            } else {
                                return LocalTime.parse(dto.getStart());
                            }
                        })
                )
                .toList();

        String weekRange = startDate.toString() + " ~ " + endDate.toString();

        return FreeTimeWeekResponseDTO.builder()
                .week(weekRange)
                .freeTimeCalendar(responseList)
                .build();
    }
}