package org.example.planlist.repository;

import org.example.planlist.entity.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    Optional<FriendRequest> findByFriendRequestId(Long friendRequestId);

}
