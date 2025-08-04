package org.example.planlist.service.Friend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.FriendDTO.request.RequestSendRequestDTO;
import org.example.planlist.entity.FriendRequest;
import org.example.planlist.entity.User;
import org.example.planlist.repository.FriendRepository;
import org.example.planlist.repository.FriendRequestRepository;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class FriendManageService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final FriendRepository friendRepository;

    public Optional<User> findByEmail(String email) {return userRepository.findByEmail(email);}


    @Transactional
    public void sendFriendRequest(RequestSendRequestDTO requestSendRequestDTO) {

        String email = requestSendRequestDTO.getEmail();
        User receiver = findByEmail(email).orElseThrow(() ->
                new IllegalArgumentException("해당 이메일의 사용자가 없습니다."));
        User sender = SecurityUtil.getCurrentUser();

        // 🔒 이미 요청이 존재하는지 확인
        if (friendRequestRepository.existsBySenderAndReceiver(sender, receiver)) {
            throw new IllegalStateException("이미 해당 사용자에게 친구 요청을 보냈습니다.");
        }

        // 🔒 이미 요청이 존재하는지 확인
        if (friendRequestRepository.existsBySenderAndReceiver(receiver, sender)) {
            throw new IllegalStateException("해당 사용자가 보낸 친구요청이 이미 존재합니다.");
        }

        // 🔒 이미 친구 관계인 경우도 막고 싶다면 추가 체크
        if (friendRepository.existsByUser1AndUser2(sender, receiver)||friendRepository.existsByUser1AndUser2(receiver, sender)) {
            throw new IllegalStateException("이미 친구로 등록되어 있습니다.");
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
//                .message(requestSendRequestDTO.getMessage()) // 필요하다면
                .build();

        friendRequestRepository.save(friendRequest);
    }

}
