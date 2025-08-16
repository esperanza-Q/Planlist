package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@NoArgsConstructor
@Entity
//@Builder
@Setter
@SuperBuilder
@AllArgsConstructor
@Table(name="pt_session")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorValue("PT")
public class PtSession extends PlannerSession {
    private String goal;

    @OneToMany(mappedBy = "planner", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<PtComment> ptComments;

    @OneToMany(mappedBy = "planner", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<ExercisePlan> exercisePlans;


}
