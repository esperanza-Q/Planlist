package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "planner_sessions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@DiscriminatorColumn(name = "session_type") // 선택사항: DTYPE 대신 이름 지정
public abstract class PlannerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "planner_id", unique = true)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PlannerProject project;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    private Integer week;
    private LocalDate date;
//    private LocalTime time;

    private LocalTime startTime;
    private LocalTime endTime;
    private String location;

    @Column(name = "is_finalized", nullable = false)
    private Boolean isFinalized;
}
