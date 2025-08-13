package org.example.planlist.controller.Friend;


import org.example.planlist.dto.FriendDTO.request.FriendEmailRequestDTO;
import org.example.planlist.dto.FriendDTO.request.RequestSendRequestDTO;
import org.example.planlist.dto.FriendDTO.response.FriendListResponseDTO;
import org.example.planlist.service.Friend.FriendManageService;
import org.example.planlist.service.Friend.FriendService;
import org.example.planlist.service.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/friend")
public class FriendController {
    private final UserService userService;
    private final FriendManageService friendManageService;
    private final FriendService friendService;

    public FriendController(UserService userService, FriendManageService friendManageService, FriendService friendService) {
        this.userService = userService;
        this.friendManageService = friendManageService;
        this.friendService = friendService;
    }

    @GetMapping("")
    public ResponseEntity<FriendListResponseDTO> getAllFriends() {
        FriendListResponseDTO response = friendService.getAllFriendsForCurrentUser();
        return ResponseEntity.ok(response);
    }

    //친구요청보내기
    @PostMapping("/sendRequest")
    public ResponseEntity<String> sendFriendRequest(@RequestBody RequestSendRequestDTO requestSendRequestDTO) {
        friendManageService.sendFriendRequest(requestSendRequestDTO);

        return ResponseEntity.ok("친구 요청 성공!");
    }

    //친구요청수락
    @PostMapping("/acceptRequest")
    public ResponseEntity<String> acceptFriendRequest(@RequestBody FriendEmailRequestDTO friendEmailRequestDTO) {
        friendManageService.acceptFriendRequest(friendEmailRequestDTO);

        return ResponseEntity.ok("친구 요청을 수락하였습니다.");
    }

    //친구요청거절
    @DeleteMapping("/rejectRequest")
    public ResponseEntity<String> rejectFriendRequest(@RequestBody FriendEmailRequestDTO friendEmailRequestDTO) {
        friendManageService.rejectFriendRequest(friendEmailRequestDTO);

        return ResponseEntity.ok("친구 요청을 거절하였습니다.");
    }

    //친구삭제
    @DeleteMapping("/friendDelete")
    public ResponseEntity<String> friendDelete(@RequestBody FriendEmailRequestDTO friendEmailRequestDTO) {
        friendManageService.friendDelete(friendEmailRequestDTO);

        return ResponseEntity.ok("친구를 삭제했습니다.");
    }


}
