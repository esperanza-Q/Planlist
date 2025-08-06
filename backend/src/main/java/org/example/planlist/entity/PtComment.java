package org.example.planlist.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor
@Entity
@Builder
@AllArgsConstructor
@Table(name="PtComment")
public class PtComment {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "ptComment_id")
    private Long ptCommentId;

    private String content;

    @ManyToOne
    @JoinColumn(name="planner_id")
    @JsonBackReference
    private PlannerSession planner;

    @ManyToOne
    @JoinColumn(name="user_id")
    @JsonBackReference
    private User user;

}
