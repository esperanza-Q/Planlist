package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "standard_sessions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "planner_id")
@DiscriminatorValue("STANDARD")
@Inheritance(strategy = InheritanceType.JOINED)
public class StandardSession extends PlannerSession {


    private String address;

    private Float latitude;

    private Float longitude;
}
