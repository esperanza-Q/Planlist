package org.example.planlist.service.Friend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.entity.Friend;
import org.example.planlist.entity.User;
import org.example.planlist.repository.FriendRepository;
import org.example.planlist.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j

public class FriendService {

    private final UserRepository userRepository;
    private final FriendRepository friendRepository;

    //친구DB아이디 찾기
    public Optional<Friend> findByFriendId(Long friendId) {return friendRepository.findByFriendId(friendId);}

    //친구 이메일로 찾기 ( 여기서 좀 더 변경 필요. 현재는 그냥 유저 이메일로 찾는 거임 )
    public Optional<User> findByEmail(String email) {return userRepository.findByEmail(email);}

    //해당 유저가 가진 모든 친구 목록을 합쳐서 반환
    @Transactional
    public List<User> getAllFriends(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // user가 user1인 친구 관계에서 상대방 user2 모으기
        List<User> friendsFromUser1 = user.getFriends1().stream()
                .map(Friend::getUser2)
                .collect(Collectors.toList());

        // user가 user2인 친구 관계에서 상대방 user1 모으기
        List<User> friendsFromUser2 = user.getFriends2().stream()
                .map(Friend::getUser1)
                .collect(Collectors.toList());

        // 둘 합치기 (중복 제거 포함)
        Set<User> allFriends = new HashSet<>();
        allFriends.addAll(friendsFromUser1);
        allFriends.addAll(friendsFromUser2);

        return new ArrayList<>(allFriends);
    }
}

