package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "meeting_sessions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "planner_id")
public class MeetingSession extends PlannerSession {

    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_unit", nullable = false)
    private RecurrenceUnit recurrenceUnit;

    @Column(name = "recurrence_count", nullable = false)
    private Integer recurrenceCount;

    // Enum
    public enum RecurrenceUnit {
        DAILY,
        WEEKLY
    }
}
