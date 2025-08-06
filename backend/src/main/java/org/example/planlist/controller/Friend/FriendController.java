package org.example.planlist.controller.Friend;


import jakarta.validation.Valid;
import org.example.planlist.apiPayload.code.SuccessStatus;
import org.example.planlist.apiPayload.dto.ApiResponse;
import org.example.planlist.dto.FriendDTO.request.RequestAcceptRequestDTO;
import org.example.planlist.dto.FriendDTO.request.RequestRejectRequestDTO;
import org.example.planlist.dto.FriendDTO.request.RequestSendRequestDTO;
import org.example.planlist.dto.UserDTO.request.UserSignupRequestDTO;
import org.example.planlist.service.Friend.FriendManageService;
import org.example.planlist.service.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/friend")
public class FriendController {
    private final UserService userService;
    private final FriendManageService friendManageService;

    public FriendController(UserService userService, FriendManageService friendManageService) {
        this.userService = userService;
        this.friendManageService = friendManageService;
    }

    //친구요청보내기
    @PostMapping("/sendRequest")
    public ResponseEntity<String> sendFriendRequest(@RequestBody RequestSendRequestDTO requestSendRequestDTO) {
        friendManageService.sendFriendRequest(requestSendRequestDTO);

        return ResponseEntity.ok("친구 요청 성공!");
    }

    //친구요청수락
    @PostMapping("/acceptRequest")
    public ResponseEntity<String> acceptFriendRequest(@RequestBody RequestAcceptRequestDTO requestAcceptRequestDTO) {
        friendManageService.acceptFriendRequest(requestAcceptRequestDTO);

        return ResponseEntity.ok("친구 요청을 수락하였습니다.");
    }

    //친구요청거절
    @DeleteMapping("/rejectRequest")
    public ResponseEntity<String> rejectFriendRequest(@RequestBody RequestRejectRequestDTO requestRejectRequestDTO) {
        friendManageService.rejectFriendRequest(requestRejectRequestDTO);

        return ResponseEntity.ok("친구 요청을 거절하였습니다.");
    }


}
