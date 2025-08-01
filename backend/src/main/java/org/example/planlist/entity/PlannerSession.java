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
    private LocalTime time;
    private String location;

    @Column(name = "id_finalized", nullable = false)
    private Boolean isFinalized;
}
