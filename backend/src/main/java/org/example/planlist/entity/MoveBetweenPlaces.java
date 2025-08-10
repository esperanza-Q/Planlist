package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name="move_between_places")
public class MoveBetweenPlaces {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "move_id", nullable = false)
    private Long moveId;

    @Column(name = "transportation", nullable = false)
    private String transportation;

    @Column(name = "duration_min", nullable = false)
    private Long durationMin;

    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;

    @ManyToOne
    @JoinColumn(name = "calendar_id")
    private DatePlanner datePlanner;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private PlannerProject project;
}
