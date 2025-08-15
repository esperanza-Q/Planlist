package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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
@DiscriminatorValue("MEETING")
@Inheritance(strategy = InheritanceType.JOINED)
public class MeetingSession extends PlannerSession {
    @Column(nullable = false)
    private String subTitle;

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
