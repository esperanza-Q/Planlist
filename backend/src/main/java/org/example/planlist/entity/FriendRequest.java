package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name="FriendRequest")
public class FriendRequest {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "friendRequest_id", unique = true, nullable = false)
    private Long friendRequestId;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    @JsonBackReference
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    @JsonBackReference
    private User receiver;

    @Column(nullable = false)
    private LocalDate friendRequestDate;

    @PrePersist //jpa의 콜백 메서드. 엔터티가 처음 저장되기 직전에 실행. 즉, 새로운 row 생성시 현재 날짜 저장
    protected void onCreate() { this.friendRequestDate = LocalDate.now(); }
}