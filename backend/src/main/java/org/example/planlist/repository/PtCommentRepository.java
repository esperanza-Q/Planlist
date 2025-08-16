package org.example.planlist.repository;

import org.example.planlist.entity.PtComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PtCommentRepository extends JpaRepository<PtComment, Long> {
    Optional<PtComment> findByPtCommentId(Long ptCommentid);
}
