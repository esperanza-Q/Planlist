package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "planner_projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlannerProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id", unique = true, nullable = false)
    private Long projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(name = "project_title", nullable = false)
    private String projectTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<ProjectParticipant> participants;

    // Enum
    public enum Category {
        Meeting,
        Travel,
        PT,
        Standard
    }

    public enum Status {
        UPCOMMING,
        INPROGRESS,
        FINISHED
    }

    @PrePersist
    @PreUpdate
    private void autoSetConfirmedAt() {
        if (projectTitle != null &&
                category != null &&
                status != null &&
                startDate != null &&
                participants != null &&
                createdAt != null
        ) {
            confirmedAt = LocalDateTime.now();
        }
    }

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DatePlanner> datePlanners = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Wishlist> wishlists = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MoveBetweenPlaces> moveBetweenPlacesList = new ArrayList<>();
}
