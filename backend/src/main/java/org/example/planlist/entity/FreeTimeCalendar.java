package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name="FreeTimeCalendar")
public class FreeTimeCalendar {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "freetime_id", unique = true, nullable = false)
    private Long freetimeId;

    private LocalDate availableDate;

    private LocalDateTime createdAt;

    @PrePersist //jpa의 콜백 메서드. 엔터티가 처음 저장되기 직전에 실행. 즉, 새로운 row 생성시 현재 날짜 저장
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    @Column(nullable = false)
    private Boolean all_day;

    private Integer availableStartHour;

    private Integer availableStartMin;

    private Integer availableEndHour;

    private Integer availableEndMin;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;



}
