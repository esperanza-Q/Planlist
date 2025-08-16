package org.example.planlist.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Setter
@Entity
@Table(name = "notes")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "note_id", nullable = false, unique = true)
    private Long noteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PlannerProject project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;

//    @ElementCollection(fetch = FetchType.LAZY)
//    @CollectionTable(name = "note_images", joinColumns = @JoinColumn(name = "note_id"))
//    @Column(name = "image_url")
//    private List<String> image = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "note_images", joinColumns = @JoinColumn(name = "note_id"))
    @Column(name = "image_url")
    private List<String> image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Share share;

    // Enum
    public enum Share {
        PERSONAL,
        GROUP
    }

    public void update(String title, String content, Share share) {
        this.title = title;
        this.content = content;
        this.share = share;
    }
}
