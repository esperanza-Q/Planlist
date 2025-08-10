package org.example.planlist.repository;

import org.example.planlist.entity.Friend;
import org.example.planlist.entity.FriendRequest;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {
    Optional<Friend> findByFriendId(Long friendId);

    boolean existsByUser1AndUser2(User user1, User user2);

    Optional<Friend> findByUser1AndUser2(User friend, User me);

    List<Friend> findAllByUser1OrUser2(User user1, User user2);

    @Query(value = "SELECT user2_id FROM friend WHERE user1_id = :userId " +
            "UNION " +
            "SELECT user1_id FROM friend WHERE user2_id = :userId",
            nativeQuery = true)
    List<Long> findFriendIdsByUserId(@Param("userId") Long userId);
}
