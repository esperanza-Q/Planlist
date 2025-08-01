package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_participants")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invitee_id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PlannerProject project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Response response;

    @Column(name = "response_at")
    private LocalDateTime responseAt;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Enum
    public enum Response {
        WAITING,
        ACCEPTED,
        REJECTED
    }

    public enum Role {
        TRAINER,
        TRAINEE
    }
}
