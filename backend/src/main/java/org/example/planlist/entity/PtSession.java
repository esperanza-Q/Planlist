package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name="PtSession")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorValue("PT")
public class PtSession extends PlannerSession {
    private String goal;

    @OneToMany(mappedBy = "planner", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<PtComment> PtComments;

    @OneToMany(mappedBy = "planner", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<ExercisePlan> ExercisePlans;


}
