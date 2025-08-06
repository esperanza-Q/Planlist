package org.example.planlist.repository;

import org.example.planlist.entity.ProjectCount;
import org.example.planlist.entity.ProjectParticipant;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectParticipantRepository extends JpaRepository<ProjectParticipant, Long> {
    List<ProjectParticipant> findByUser(User user);
    Optional<ProjectParticipant> findById(Long id);

}
