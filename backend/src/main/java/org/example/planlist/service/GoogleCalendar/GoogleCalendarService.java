package org.example.planlist.service.GoogleCalendar;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.Events;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

//@Service
//public class GoogleCalendarService {
//
//    private static final String APPLICATION_NAME = "Planlist";
//    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
//
//    public List<Event> getUpcomingEvents(
//            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient
//    ) throws GeneralSecurityException, IOException {
//
//        var httpTransport = GoogleNetHttpTransport.newTrustedTransport();
//
//        String accessToken = authorizedClient.getAccessToken().getTokenValue();
//
//        Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY,
//                (HttpRequest request) -> {
//                    request.getHeaders().setAuthorization("Bearer " + accessToken);
//                })
//                .setApplicationName(APPLICATION_NAME)
//                .build();
//
//
//        DateTime timeMin = new DateTime("2025-08-01T00:00:00Z");
//        DateTime timeMax = new DateTime("2025-08-31T23:59:59Z");
//
//        Events events = service.events().list("primary")
//                .setMaxResults(50)
//                .setOrderBy("startTime")
//                .setSingleEvents(true)
//                .setTimeMin(timeMin)
//                .setTimeMax(timeMax)
//                .execute();
////        Events events = service.events().list("primary")
////                .setMaxResults(50)  // 더 많이 받는 게 좋음
////                .setOrderBy("startTime")
////                .setSingleEvents(true)
////                .execute();
//
//        List<Event> allEvents = events.getItems();
//
//        // 생일 이벤트(eventType = "birthday")를 제외하고 필터링
//        List<Event> filteredEvents = allEvents.stream()
//                .filter(event -> !"birthday".equals(event.get("eventType")))
//                .toList();
//
//        return filteredEvents;
//    }
//}

@Service
public class GoogleCalendarService {

    private final String clientId;
    private final String clientSecret;

    public GoogleCalendarService(
            @Value("${spring.security.oauth2.client.registration.google.client-id}") String clientId,
            @Value("${spring.security.oauth2.client.registration.google.client-secret}") String clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public String addEvent(String accessToken, String refreshToken, String title,
                           LocalDateTime start, LocalDateTime end) throws Exception {

        GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(GoogleNetHttpTransport.newTrustedTransport())
                .setJsonFactory(GsonFactory.getDefaultInstance())
                .setClientSecrets(clientId, clientSecret)
                .build();

        credential.setAccessToken(accessToken);
        credential.setRefreshToken(refreshToken);

        // 토큰 만료 임박 시 자동 갱신
        if (credential.getExpiresInSeconds() != null && credential.getExpiresInSeconds() <= 60) {
            boolean success = credential.refreshToken();
            if (!success) {
                throw new IllegalStateException("구글 토큰 갱신 실패, 다시 로그인 필요");
            }
            // 갱신된 토큰은 호출한 쪽에서 DB에 반드시 저장해야 함
        }

        Calendar calendar = new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("Planner App")
                .build();

        Event event = new Event();
        event.setSummary(title);

        EventDateTime startDateTime = new EventDateTime()
                .setDateTime(new DateTime(Date.from(start.atZone(ZoneId.systemDefault()).toInstant())))
                .setTimeZone("Asia/Seoul");
        event.setStart(startDateTime);

        EventDateTime endDateTime = new EventDateTime()
                .setDateTime(new DateTime(Date.from(end.atZone(ZoneId.systemDefault()).toInstant())))
                .setTimeZone("Asia/Seoul");
        event.setEnd(endDateTime);

        Event createdEvent = calendar.events().insert("primary", event).execute();

        return createdEvent.getHtmlLink();
    }

    private Calendar buildCalendar(String accessToken, String refreshToken) throws Exception {
        GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(GoogleNetHttpTransport.newTrustedTransport())
                .setJsonFactory(GsonFactory.getDefaultInstance())
                .setClientSecrets(clientId, clientSecret)
                .build();
        credential.setAccessToken(accessToken);
        credential.setRefreshToken(refreshToken);

        // 만료 임박 시 자동 갱신
        if (credential.getExpiresInSeconds() != null && credential.getExpiresInSeconds() <= 60) {
            if (!credential.refreshToken()) {
                throw new IllegalStateException("구글 토큰 갱신 실패, 다시 로그인 필요");
            }
        }

        return new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential
        ).setApplicationName("Planner App").build();
    }

    /**
     * [추가] 여행 프로젝트 기간을 올데이 멀티데이 1건으로 업서트.
     * - DB 수정 없이, 구글 이벤트의 private extendedProperties에 projectId 저장
     * - 다음 호출에서 같은 projectId로 검색 → 있으면 update, 없으면 insert
     */
    public String upsertTripAllDayEventByProject(
            String accessToken,
            String refreshToken,
            Long projectId,
            String projectTitle,
            LocalDate startDateInclusive,
            LocalDate endDateInclusive,
            String calendarId // 일반적으로 "primary"
    ) throws Exception {

        Calendar svc = buildCalendar(accessToken, refreshToken);

        // 구글 규칙: 올데이는 end가 '다음날(배타)'
        DateTime start = new DateTime(startDateInclusive.toString());
        DateTime endExcl = new DateTime(endDateInclusive.plusDays(1).toString());

        // 기존 이벤트 존재 여부 조회 (extendedProperties로 필터)
        Events list = svc.events().list(calendarId)
                .setSingleEvents(true)
                .setPrivateExtendedProperty(
                        Collections.singletonList("projectId=" + projectId)
                )
                .execute();

        // 이벤트 바디 구성
        Event event = new Event()
                .setSummary("여행: " + projectTitle)
                .setStart(new EventDateTime().setDate(start))
                .setEnd(new EventDateTime().setDate(endExcl));

        // 필요하면 설명/위치 세팅
        // event.setDescription(...); event.setLocation(...);

        // private extended properties에 projectId 심기
        Map<String, String> priv = new HashMap<>();
        priv.put("projectId", String.valueOf(projectId));
        event.setExtendedProperties(new Event.ExtendedProperties().setPrivate(priv));

        if (list.getItems() != null && !list.getItems().isEmpty()) {
            // 업데이트
            String existingEventId = list.getItems().get(0).getId();
            Event updated = svc.events().update(calendarId, existingEventId, event).execute();
            return updated.getHtmlLink(); // 참고용
        } else {
            // 새로 생성
            Event created = svc.events().insert(calendarId, event).execute();
            return created.getHtmlLink();
        }
    }

    /** [추가] projectId로 저장된 여행 이벤트 삭제 */
    public void deleteTripEventByProject(
            String accessToken,
            String refreshToken,
            Long projectId,
            String calendarId // "primary"
    ) throws Exception {
        Calendar svc = buildCalendar(accessToken, refreshToken);
        Events list = svc.events().list(calendarId)
                .setSingleEvents(true)
                .setPrivateExtendedProperty(
                        Collections.singletonList("projectId=" + projectId)
                )
                .execute();


        if (list.getItems() == null || list.getItems().isEmpty()) return;

        for (Event e : list.getItems()) {
            svc.events().delete(calendarId, e.getId()).execute();
        }
    }
}