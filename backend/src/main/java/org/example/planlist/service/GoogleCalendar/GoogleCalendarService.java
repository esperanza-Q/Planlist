package org.example.planlist.service.GoogleCalendar;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "Planlist";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    public List<Event> getUpcomingEvents(
            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient
    ) throws GeneralSecurityException, IOException {

        var httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        String accessToken = authorizedClient.getAccessToken().getTokenValue();

        Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY,
                (HttpRequest request) -> {
                    request.getHeaders().setAuthorization("Bearer " + accessToken);
                })
                .setApplicationName(APPLICATION_NAME)
                .build();


        DateTime timeMin = new DateTime("2025-08-01T00:00:00Z");
        DateTime timeMax = new DateTime("2025-08-31T23:59:59Z");

        Events events = service.events().list("primary")
                .setMaxResults(50)
                .setOrderBy("startTime")
                .setSingleEvents(true)
                .setTimeMin(timeMin)
                .setTimeMax(timeMax)
                .execute();
//        Events events = service.events().list("primary")
//                .setMaxResults(50)  // 더 많이 받는 게 좋음
//                .setOrderBy("startTime")
//                .setSingleEvents(true)
//                .execute();

        List<Event> allEvents = events.getItems();

        // 생일 이벤트(eventType = "birthday")를 제외하고 필터링
        List<Event> filteredEvents = allEvents.stream()
                .filter(event -> !"birthday".equals(event.get("eventType")))
                .toList();

        return filteredEvents;
    }
}