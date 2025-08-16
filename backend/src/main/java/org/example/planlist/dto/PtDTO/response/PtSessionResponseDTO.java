package org.example.planlist.dto.PtDTO.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PtSessionResponseDTO {
    private String title;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<ParticipantDTO> participants;
    private List<CommentDTO> comments;
    private String todayGoal;
    private List<MyExerciseDTO> myExercises;
    private List<ExerciseDTO> exercises;
}
