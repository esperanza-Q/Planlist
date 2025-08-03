package org.example.planlist.repository;

import org.example.planlist.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {
    Optional<Friend> findByFriendId(Long friendId);
}
