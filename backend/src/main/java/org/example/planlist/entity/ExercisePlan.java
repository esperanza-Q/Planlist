package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name="ExercisePlan")
public class ExercisePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="exercisePlan_id", unique = true, nullable = false)
    private Long exercisePlanId;

    private String exercisePlanName;

    private Integer time;

    private Integer sets;

    @Enumerated(EnumType.STRING)
    private TYPE role;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;


    public enum TYPE {
        TRAINER_P,
        DONE
    }

    @ManyToOne
    @JoinColumn(name = "planner_id")
    @JsonBackReference
    private PtSession planner;


}
