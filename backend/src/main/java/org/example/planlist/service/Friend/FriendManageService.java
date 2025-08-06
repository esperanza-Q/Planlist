package org.example.planlist.service.Friend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.planlist.dto.FriendDTO.request.FriendEmailRequestDTO;
import org.example.planlist.dto.FriendDTO.request.RequestSendRequestDTO;
import org.example.planlist.entity.Friend;
import org.example.planlist.entity.FriendRequest;
import org.example.planlist.entity.User;
import org.example.planlist.repository.FriendRepository;
import org.example.planlist.repository.FriendRequestRepository;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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


        if (receiver.getId() == sender.getId()) {
            throw new IllegalStateException("본인에게는 친구요청을 보낼 수 없습니다.");
        }

        // 🔒 이미 요청이 존재하는지 확인
        if (friendRequestRepository.existsBySenderAndReceiver(sender, receiver) || friendRequestRepository.existsBySenderAndReceiver(receiver, sender)) {
            throw new IllegalStateException("이미 해당 사용자에게 친구 요청을 보냈습니다.");
        }

        // 🔒 이미 요청이 존재하는지 확인
//        if (friendRequestRepository.existsBySenderAndReceiver(receiver, sender)) {
//            throw new IllegalStateException("해당 사용자가 보낸 친구요청이 이미 존재합니다.");
//        }

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

    @Transactional
    public void acceptFriendRequest(FriendEmailRequestDTO friendEmailRequestDTO) {

        String email = friendEmailRequestDTO.getRequestEmail();
        User requester = userRepository.findByEmail(email).orElseThrow(() ->
                new IllegalArgumentException("해당 이메일의 사용자가 없습니다."));
        User me = SecurityUtil.getCurrentUser();


        FriendRequest request = friendRequestRepository.findBySenderAndReceiver(requester, me).orElse(null);

        if(request == null) {
            throw new IllegalArgumentException("해당 친구 요청이 없습니다.");
        }

        friendRequestRepository.delete(request);


        Friend friend = Friend.builder()
                .user1(me)
                .user2(requester)
//                .message(requestSendRequestDTO.getMessage()) // 필요하다면
                .build();

        friendRepository.save(friend);
    }

    @Transactional
    public void rejectFriendRequest(FriendEmailRequestDTO friendEmailRequestDTO) {

        String email = friendEmailRequestDTO.getRequestEmail();
        User requester = findByEmail(email).orElseThrow(() ->
                new IllegalArgumentException("해당 이메일의 사용자가 없습니다."));
        User me = SecurityUtil.getCurrentUser();

        FriendRequest request = friendRequestRepository.findBySenderAndReceiver(requester, me).orElse(null);;

        if(request == null) {
            throw new IllegalArgumentException("해당 친구 요청이 없습니다.");
        }

        friendRequestRepository.delete(request);

    }

    @Transactional
    public void friendDelete(FriendEmailRequestDTO friendEmailRequestDTO) {

        String email = friendEmailRequestDTO.getRequestEmail();
        User friend = findByEmail(email).orElseThrow(() ->
                new IllegalArgumentException("해당 이메일의 사용자가 없습니다."));
        User me = SecurityUtil.getCurrentUser();

        Friend request = friendRepository.findByUser1AndUser2(friend, me).orElse(null);

        if(request == null) {
            request = friendRepository.findByUser1AndUser2(me, friend).orElse(null);
        }

        if(request == null) {
            throw new IllegalArgumentException("존재하지 않는 친구입니다.");
        }

        friendRepository.delete(request);

    }

}
