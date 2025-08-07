package org.example.planlist.controller.Profile;

import lombok.RequiredArgsConstructor;
import org.example.planlist.dto.ProfileDTO.ProjectRequestWrapperDTO;
import org.example.planlist.dto.ProfileDTO.request.ProjectRequestIdDTO;
import org.example.planlist.service.Profile.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping(" ")
    public ResponseEntity<ProjectRequestWrapperDTO> getProfile() {
        ProjectRequestWrapperDTO response = profileService.getProfile();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/acceptProject")
    public ResponseEntity<String> acceptProjectRequest(@RequestBody ProjectRequestIdDTO requestDTO) {
        profileService.acceptProjectRequest(requestDTO);
        return ResponseEntity.ok("프로젝트 요청이 승인되었습니다.");
    }

    @PutMapping("/rejectProject")
    public ResponseEntity<String> rejectProjectRequest(@RequestBody ProjectRequestIdDTO requestDTO) {
        profileService.rejectProjectRequest(requestDTO);
        return ResponseEntity.ok("프로젝트 요청이 거절되었습니다.");
    }
}
