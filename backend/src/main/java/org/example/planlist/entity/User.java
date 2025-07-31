package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "profile_image", nullable = false)
    private String profileImage;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "creator", fetch = FetchType.LAZY) // 필드 지연 로딩 -> 성능 저하 방지
    private List<PlannerProject> createdProjects;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<ProjectParticipant> projectParticipants;
}
