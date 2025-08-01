package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "participant_availability")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shared_id", nullable = false)
    private Long sharedId;

    @Column(name = "date", nullable = true)
    private LocalDate date;

    @Column(name = "all_day", nullable = false)
    private Boolean all_day;

    @Column(name = "start_time", nullable = true)
    private LocalDateTime start_time;

    @Column(name = "end_time", nullable = true)
    private LocalDateTime end_time;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PlannerProject project;

}
