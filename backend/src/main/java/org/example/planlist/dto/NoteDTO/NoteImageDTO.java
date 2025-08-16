package org.example.planlist.dto.NoteDTO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteImageDTO {
//    @ElementCollection
//    @CollectionTable(name = "note_images", joinColumns = @JoinColumn(name = "note_id"))
//    @Column(name = "image_url")
    private List<String> image;

}
