package org.example.planlist.service.PT;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.PT.request.PtCommentRequestDTO;
import org.example.planlist.dto.PT.request.TodayGoalRequestDTO;
import org.example.planlist.dto.PT.response.*;
import org.example.planlist.entity.*;
import org.example.planlist.repository.*;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PtSessionService {

    private final PtSessionRepository ptSessionRepository;
    private final ProjectParticipantRepository projectParticipantRepository;
    private final PlannerSessionRepository plannerSessionRepository;
    private final PtCommentRepository ptCommentRepository;
    private final ExerciseRepository exerciseRepository;

    public PtSessionResponseDTO getPtSession(Long sessionId) {
        PtSession ptSession = ptSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다."));

        // Participants
        List<ParticipantDTO> participants = projectParticipantRepository
                .findByProject(ptSession.getProject())
                .stream()
                .map(pp -> ParticipantDTO.builder()
                        .name(pp.getUser().getName())
                        .profileImage(pp.getUser().getProfileImage())
                        .build()
                ).toList();

        // Comments

        List<CommentDTO> comments = ptSession.getPtComments().stream()
                .map(c -> {
                    // 코멘트 작성자 User
                    User commentUser = c.getUser();

                    // 참여자 리스트에서 작성자 User와 일치하는 참가자 찾기
                    ProjectParticipant participant = ptSession.getProject().getParticipants().stream()
                            .filter(p -> p.getUser().equals(commentUser))
                            .findFirst()
                            .orElse(null);

                    // 역할(role) 꺼내기 (없으면 "UNKNOWN" 처리)
                    String role = (participant != null) ? participant.getRole().name() : "UNKNOWN";

                    return CommentDTO.builder()
                            .commentId(c.getPtCommentId())
                            .name(commentUser.getName())
                            .profileImage(commentUser.getProfileImage())
                            .role(role)
                            .content(c.getContent())
                            .build();
                }).toList();

        // MyExercises
        List<MyExerciseDTO> myExercises = ptSession.getExercisePlans().stream()
                .map(plan -> plan.getExercise().stream()
                        .map(ex -> MyExerciseDTO.builder()
                                .exercisePlanId(plan.getExercisePlanId())
                                .exerciseName(ex.getName())
                                .time(plan.getTime())
                                .sets(plan.getSets())
                                .type(plan.getRole()) // TRAINER_P / DONE
                                .build()
                        )
                ).flatMap(s -> s).toList();

        // Exercises (중복 제거 가능하면 distinct() 추가)
//        List<ExerciseDTO> exercises = ptSession.getExercisePlans().stream()
//                .flatMap(plan -> plan.getExercise().stream())
//                .distinct()  // 필요시 equals/hashCode 구현 후 중복 제거
//                .map(ex -> ExerciseDTO.builder()
//                        .exerciseId(ex.getExerciseId())
//                        .exerciseName(ex.getName())
//                        .build()
//                ).toList();

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

//    public List<ExerciseDTO> getAllExercises() {
//        List<Exercise> exercises = exerciseRepository.findAll();
//        return exercises.stream()
//                .map(ex -> ExerciseDTO.builder()
//                        .exerciseId(ex.getExerciseId())
//                        .exerciseName(ex.getName())
//                        .build())
//                .collect(Collectors.toList());
//    }

}
