package org.example.planlist.repository;

import org.example.planlist.entity.ProjectCount;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectCountRepository extends JpaRepository<ProjectCount, Long> {
    Optional<ProjectCount> findByProjectCountId(Long projectCountId);
    Optional<ProjectCount> findByUser(User user);
}
