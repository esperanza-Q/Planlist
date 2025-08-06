package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name= "date_planner")
public class DatePlanner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calendar_id", nullable = false)
    private Long calendarId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    public enum Category {
        PLACE,
        RESTAURANT,
        ACCOMMODATION,
        TRANSPORT,
        MEMO
    }

    @Column(name = "memo")
    private String memo;

    @Column(name = "cost")
    private Long cost;

    @Column(name = "address")
    private String address;

    @Column(name = "latitude")
    private Float latitude;

    @Column(name = "longitude")
    private Float longitude;

    @Column(name = "visit_time")
    private LocalDateTime visitTime;

    @Column(name = "created_at") // 예외 발생시를 위해 nullable
    private LocalDateTime createdAt;

    @PrePersist // 객체가 처음 저장될 때 자동으로 시간 기록
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @ManyToOne
    @JoinColumn(name = "project_id")
    private PlannerProject project;

    @ManyToOne
    @JoinColumn(name = "wishlist_id")
    private Wishlist wishlist;
}
