package org.example.planlist.controller.GoogleCalendar;

import com.google.api.services.calendar.model.Event;
import org.example.planlist.service.GoogleCalendar.GoogleCalendarService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@RestController
public class CalendarController {

    private final GoogleCalendarService googleCalendarService;

    public CalendarController(GoogleCalendarService googleCalendarService) {
        this.googleCalendarService = googleCalendarService;
    }

    @GetMapping("/calendar/events")
    public List<Event> getEvents(@RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient)
            throws IOException, GeneralSecurityException {
        return googleCalendarService.getUpcomingEvents(authorizedClient);
    }
}
