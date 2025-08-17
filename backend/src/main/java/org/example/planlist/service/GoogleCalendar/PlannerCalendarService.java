package org.example.planlist.service.GoogleCalendar;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.example.planlist.entity.PlannerProject;
import org.example.planlist.entity.PlannerSession;
import org.example.planlist.entity.User;
import org.example.planlist.repository.PlannerProjectRepository;
import org.example.planlist.repository.PlannerSessionRepository;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PlannerCalendarService {

    private final PlannerProjectRepository projectRepository;
    private final PlannerSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final GoogleCalendarService googleCalendarService;

    public String addProjectToGoogleCalendar(Long userId, Long projectId, Long sessionId) throws Exception {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        String accessToken = user.getGoogleAccessToken();
        String refreshToken = user.getGoogleRefreshToken();

        if (accessToken == null ) {
            throw new IllegalStateException("Google 토큰이 없습니다. 다시 로그인 해주세요.");
        }

        PlannerProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        String title;
        LocalDateTime startDateTime;
        LocalDateTime endDateTime;

        if (project.getCategory() == PlannerProject.Category.Travel) {
            title = project.getProjectTitle();
            startDateTime = project.getStartDate().atTime(9, 0);
            endDateTime = project.getEndDate().atTime(18, 0);
        } else {
            PlannerSession session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));
            title = session.getTitle();
            startDateTime = session.getDate().atTime(session.getStartTime());
            endDateTime = session.getDate().atTime(session.getEndTime());
        }

        // GoogleCalendarService 호출 전 토큰 갱신 시도
        GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(GoogleNetHttpTransport.newTrustedTransport())
                .setJsonFactory(GsonFactory.getDefaultInstance())
                .setClientSecrets("YOUR_CLIENT_ID", "YOUR_CLIENT_SECRET")
                .build();

        credential.setAccessToken(accessToken);
        credential.setRefreshToken(refreshToken);

        if (credential.getExpiresInSeconds() != null && credential.getExpiresInSeconds() <= 60) {
            boolean refreshed = credential.refreshToken();
            if (!refreshed) {
                throw new IllegalStateException("토큰 갱신 실패, 재로그인 필요");
            }
            // 갱신된 토큰 DB에 저장
            user.setGoogleAccessToken(credential.getAccessToken());
            userRepository.save(user);

            accessToken = credential.getAccessToken();
        }

        return googleCalendarService.addEvent(accessToken, refreshToken, title, startDateTime, endDateTime);
    }

    public String upsertTravelPeriodEventByProject(Long userId, Long projectId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        String accessToken = user.getGoogleAccessToken();
        String refreshToken = user.getGoogleRefreshToken();
        if (accessToken == null) throw new IllegalStateException("Google 토큰이 없습니다. 다시 로그인 해주세요.");

        PlannerProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
        if (project.getCategory() != PlannerProject.Category.Travel) {
            throw new IllegalArgumentException("여행 카테고리만 저장할 수 있습니다.");
        }

        return googleCalendarService.upsertTripAllDayEventByProject(
                accessToken, refreshToken,
                projectId,
                project.getProjectTitle(),
                project.getStartDate(),
                project.getEndDate(),
                "primary"
        );
    }

    public void deleteTravelPeriodEventByProject(Long userId, Long projectId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        String accessToken = user.getGoogleAccessToken();
        String refreshToken = user.getGoogleRefreshToken();
        if (accessToken == null) return;

        googleCalendarService.deleteTripEventByProject(
                accessToken, refreshToken, projectId, "primary"
        );
    }
}