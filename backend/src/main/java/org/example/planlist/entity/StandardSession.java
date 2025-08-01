package org.example.planlist.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "standard_sessions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "planner_id")
public class StandardSession extends PlannerSession {

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Float latitude;

    @Column(nullable = false)
    private Float longitude;
}
