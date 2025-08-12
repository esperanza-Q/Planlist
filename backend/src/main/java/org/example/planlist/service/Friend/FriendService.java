package org.example.planlist.service.Friend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.FriendDTO.response.FriendResponseDTO;
import org.example.planlist.dto.FriendDTO.response.FriendListResponseDTO;
import org.example.planlist.dto.FriendDTO.response.FriendrequestResponseDTO;
import org.example.planlist.entity.Friend;
import org.example.planlist.entity.FriendRequest;
import org.example.planlist.entity.User;
import org.example.planlist.repository.FriendRepository;
import org.example.planlist.repository.FriendRequestRepository;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendService {

    private final FriendRepository friendRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;

    public FriendListResponseDTO getAllFriendsForCurrentUser() {
        User currentUser = SecurityUtil.getCurrentUser();

        // 1. 중복 없는 친구 리스트
        List<User> uniqueFriends = getUniqueFriends(currentUser);

        List<FriendResponseDTO> friendResponseDTOS = uniqueFriends.stream()
                .map(friendUser -> new FriendResponseDTO(
                        friendUser.getName(),
                        friendUser.getEmail(),
                        friendUser.getProfileImage()))
                .collect(Collectors.toList());

        // 2. 받은 친구 요청 (중복 제거 X)
        List<FriendRequest> receivedRequests = friendRequestRepository.findAllByReceiver(currentUser);

        List<FriendrequestResponseDTO> requestDTOs = receivedRequests.stream()
                .map(req -> {
                    User sender = req.getSender();
                    return new FriendrequestResponseDTO(
                            sender.getName(),
                            sender.getEmail(),
                            sender.getProfileImage()
                    );
                })
                .collect(Collectors.toList());

        return new FriendListResponseDTO(friendResponseDTOS, requestDTOs);
    }

    /**
     * 유저 기준으로 친구 목록을 양방향으로 조회하고 중복 제거
     */
    private List<User> getUniqueFriends(User user) {
        // user가 user1인 친구 관계에서 상대방 user2 모으기
        List<User> friendsFromUser1 = user.getFriends1().stream()
                .map(Friend::getUser2)
                .collect(Collectors.toList());

        // user가 user2인 친구 관계에서 상대방 user1 모으기
        List<User> friendsFromUser2 = user.getFriends2().stream()
                .map(Friend::getUser1)
                .collect(Collectors.toList());

        // 중복 제거
        Set<User> allFriends = new HashSet<>();
        allFriends.addAll(friendsFromUser1);
        allFriends.addAll(friendsFromUser2);

        return new ArrayList<>(allFriends);
    }
}

