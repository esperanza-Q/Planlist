package org.example.planlist.controller.GoogleCalendar;

import com.google.api.services.calendar.model.Event;
import lombok.RequiredArgsConstructor;
import org.example.planlist.security.CustomUserDetails;
import org.example.planlist.service.GoogleCalendar.GoogleCalendarService;
import org.example.planlist.service.GoogleCalendar.PlannerCalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

//@RestController
//public class CalendarController {
//
//    private final GoogleCalendarService googleCalendarService;
//
//    public CalendarController(GoogleCalendarService googleCalendarService) {
//        this.googleCalendarService = googleCalendarService;
//    }
//
//    @GetMapping("/calendar/events")
//    public List<Event> getEvents(@RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient)
//            throws IOException, GeneralSecurityException {
//        return googleCalendarService.getUpcomingEvents(authorizedClient);
//    }
//}

@RestController
@RequestMapping("/api/google-calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final PlannerCalendarService plannerCalendarService;

    @PostMapping("/add")
    public ResponseEntity<String> addEventToGoogleCalendar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long projectId,
            @RequestParam(required = false) Long sessionId
    ) throws Exception {

        String eventLink = plannerCalendarService.addProjectToGoogleCalendar(
                userDetails.getUser().getId(),
                projectId,
                sessionId
        );

        return ResponseEntity.ok(eventLink);
    }
}