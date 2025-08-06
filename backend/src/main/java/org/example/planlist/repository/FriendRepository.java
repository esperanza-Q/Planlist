package org.example.planlist.repository;

import org.example.planlist.entity.Friend;
import org.example.planlist.entity.FriendRequest;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {
    Optional<Friend> findByFriendId(Long friendId);
    boolean existsByUser1AndUser2(User user1, User user2);

    Optional<Friend> findByUser1AndUser2(User friend, User me);

    List<Friend> findAllByUser1OrUser2(User user1, User user2);
}
