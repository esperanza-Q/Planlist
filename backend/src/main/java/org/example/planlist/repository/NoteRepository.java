package org.example.planlist.repository;


import org.example.planlist.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface NoteRepository extends JpaRepository<Note,Long> {
    Optional<Note> findByNoteId(Long noteId);

    void deleteByNoteId(Long noteId);

    List<Note> noteId(Long noteId);

    List<Note> findAllByUserId(Long userId);

    List<Note> findByProject_ProjectId(Long projectId);

    @Query("""
    SELECT n FROM Note n
    WHERE n.user.id = :userId
       OR (n.project.id IN (
            SELECT pp.project.projectId
            FROM ProjectParticipant pp
            WHERE pp.user.id = :userId
         ) AND n.share = 'GROUP')
""")
    List<Note> findVisibleNotesForUser(@Param("userId") Long userId);
}
