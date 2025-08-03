package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name="Friend")

public class Friend {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "friend_id", unique = true, nullable = false)
    private Long friendId;

    @ManyToOne
    @JoinColumn(name = "user1_id")
    @JsonBackReference
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id")
    @JsonBackReference
    private User user2;

    @Column(nullable = false)
    private LocalDate friendDate;

    @PrePersist //jpa의 콜백 메서드. 엔터티가 처음 저장되기 직전에 실행. 즉, 새로운 row 생성시 현재 날짜 저장
    protected void onCreate() { this.friendDate = LocalDate.now(); }
}
