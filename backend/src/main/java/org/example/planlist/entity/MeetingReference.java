package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;

import java.net.URL;
import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_references")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id", nullable = false, unique = true)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planner_id", nullable = false)
    private MeetingSession planner;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false)
    private URL fileURL;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
}
