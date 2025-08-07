package org.example.planlist.repository;

<<<<<<< HEAD
import org.example.planlist.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface NoteRepository extends JpaRepository<Note,Long> {
    Optional<Note> findByNoteId(Long noteId);

    void deleteByNoteId(Long noteId);

    List<Note> noteId(Long noteId);

    List<Note> findAllByUserId(Long userId);

=======
public interface NoteRepository {
>>>>>>> 2574e59 (WIP: 작업 중인 변경사항)
}
