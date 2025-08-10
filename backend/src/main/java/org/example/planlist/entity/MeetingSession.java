package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "meeting_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "planner_id")
@DiscriminatorValue("MEETING")
public class MeetingSession extends PlannerSession {

    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_unit", nullable = false)
    private RecurrenceUnit recurrenceUnit;

    @Column(name = "recurrence_count", nullable = false)
    private Integer recurrenceCount;

    @OneToMany(mappedBy = "planner", fetch = FetchType.LAZY)
    private List<MeetingReference> references;

    // Enum
    public enum RecurrenceUnit {
        DAILY,
        WEEKLY
    }
}
