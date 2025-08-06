package org.example.planlist.repository;

import org.example.planlist.entity.Friend;
import org.example.planlist.entity.FriendRequest;
import org.example.planlist.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    Optional<FriendRequest> findByFriendRequestId(Long friendRequestId);
    boolean existsBySenderAndReceiver(User sender, User receiver);

    void deleteByFriendRequestId(Long friendRequestId);
//    void deleteByFriendRequest(FriendRequest friendRequest);

    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);

    List<FriendRequest> findAllByReceiver(User receiver);
}
