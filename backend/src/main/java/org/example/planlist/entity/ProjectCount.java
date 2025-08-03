package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name="ProjectCount")
public class ProjectCount {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "projectCount_id", unique = true, nullable = false)
    private Long projectCountId;

    private Integer upComing;
    private Integer inProgress;
    private Integer Finished;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

}
