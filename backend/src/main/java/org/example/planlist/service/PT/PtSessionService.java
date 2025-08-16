package org.example.planlist.service.PT;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PtDTO.request.ExercisePlanRequestDTO;
import org.example.planlist.dto.PtDTO.request.PtCommentRequestDTO;
import org.example.planlist.dto.PtDTO.request.TodayGoalRequestDTO;
import org.example.planlist.dto.PtDTO.response.*;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PtSessionService {

    private final PtSessionRepository ptSessionRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final PlannerSessionRepository plannerSessionRepository;
    private final PtCommentRepository ptCommentRepository;
    private final ExerciseRepository exerciseRepository;
    private final ExercisePlanRepository exercisePlanRepository;


    @Transactional(readOnly = true)
    public PtSessionResponseDTO getPtSession(Long sessionId) {
        PtSession ptSession = ptSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다."));


        List<ParticipantDTO> participants = projectParticipantRepository
                .findByProject(ptSession.getProject())
                .stream()
                .map(pp -> ParticipantDTO.builder()
                        .name(pp.getUser().getName())
                        .profileImage(pp.getUser().getProfileImage())
                        .build()
                ).toList();

        List<CommentDTO> comments = ptSession.getPtComments().stream()
                .map(c -> {
                    User commentUser = c.getUser();

                    ProjectParticipant participant = ptSession.getProject().getParticipants().stream()
                            .filter(p -> p.getUser().equals(commentUser))
                            .findFirst()
                            .orElse(null);

                    String role = (participant != null) ? participant.getRole().name() : "UNKNOWN";

                    return CommentDTO.builder()
                            .commentId(c.getPtCommentId())
                            .name(commentUser.getName())
                            .profileImage(commentUser.getProfileImage())
                            .role(role)
                            .content(c.getContent())
                            .build();
                }).toList();

        List<MyExerciseDTO> myExercises = ptSession.getExercisePlans().stream()
                .map(plan -> new MyExerciseDTO(
                        plan.getExercisePlanId(),
                        plan.getExercisePlanName(), // 이 필드가 엔티티에 있는지 확인 필요
                        plan.getTime(),
                        plan.getSets(),
                        plan.getRole(),
                        plan.getUser().getName()
                ))
                .toList();

        List<ExerciseDTO> exercises = exerciseRepository.findAll().stream()
                .map(ex -> ExerciseDTO.builder()
                        .exerciseId(ex.getExerciseId())
                        .exerciseName(ex.getName())
                        .build()
                ).toList();

        return PtSessionResponseDTO.builder()
                .title(ptSession.getTitle())
                .date(ptSession.getDate())
                .startTime(ptSession.getStartTime())
                .endTime(ptSession.getEndTime())
                .participants(participants)
                .comments(comments)
                .todayGoal(ptSession.getGoal())
                .myExercises(myExercises)
                .exercises(exercises)
                .build();
    }

    @Transactional
    public String writeComment(Long sessionId, PtCommentRequestDTO ptCommentRequestDTO) {

        User user = SecurityUtil.getCurrentUser();

        PtComment ptComment = new PtComment().builder()
                .planner(plannerSessionRepository.findById(sessionId).orElse(null))
                .content(ptCommentRequestDTO.getContent())
                .user(user)
                .build();

        ptCommentRepository.save(ptComment);

        return "성공적으로 코멘트를 작성하였습니다.";
    }

    @Transactional
    public String deleteComment(Long commentId) {

        PtComment ptComment = ptCommentRepository.findById(commentId).orElse(null);

        ptCommentRepository.delete(ptComment);

        return "성공적으로 코멘트가 삭제되었습니다.";
    }

    @Transactional
    public PtSession todayGoal(Long sessionId, TodayGoalRequestDTO todayGoalRequestDTO) {

        PtSession ptSession = ptSessionRepository.findById(sessionId).orElse(null);
        if (ptSession == null) {
            throw new RuntimeException("해당 세션을 찾을 수 없습니다.");
        }

        ptSession.setGoal(todayGoalRequestDTO.getTodayGoal());

        ptSessionRepository.save(ptSession);

        return ptSession;
    }


    @Transactional
    public ExercisePlan addExercisePlan(Long sessionId, ExercisePlan.TYPE type, ExercisePlanRequestDTO dto) {
        PtSession ptSession = ptSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("PtSession not found with id: " + sessionId));

        User user = SecurityUtil.getCurrentUser();

        Exercise exercise = exerciseRepository.findById(dto.getExerciseId())
                .orElseThrow(() -> new RuntimeException("Exercise not found with id: " + dto.getExerciseId()));
        String name = exercise.getName();

        ExercisePlan exercisePlan = ExercisePlan.builder()
                .exercisePlanName(name)
                .time(dto.getTime())
                .sets(dto.getSets())
                .role(type)
                .planner(ptSession)
                .user(user)
                .build();

        return exercisePlanRepository.save(exercisePlan);
    }

    @Transactional
    public String deleteExercisePlan(Long exercisePlanId) {
        ExercisePlan exercisePlan = exercisePlanRepository.findById(exercisePlanId)
                .orElseThrow(() -> new RuntimeException("PtSession not found with id: " + exercisePlanId));

        exercisePlanRepository.delete(exercisePlan);

        return "운동 계획이 성공적으로 삭제되었습니다.";
    }

}
