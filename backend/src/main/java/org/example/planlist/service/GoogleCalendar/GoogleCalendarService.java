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
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

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
}