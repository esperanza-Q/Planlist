package org.example.planlist.service.user;

import org.example.planlist.apiPayload.code.ErrorStatus;
import org.example.planlist.apiPayload.exception.GeneralException;
import org.example.planlist.dto.UserDTO.request.UserLoginRequestDTO;
import org.example.planlist.dto.UserDTO.request.UserSignupRequestDTO;
import org.example.planlist.dto.UserDTO.response.UserLoginResponseDTO;
import org.example.planlist.entity.User;
import org.example.planlist.repository.UserRepository;
import org.example.planlist.security.CustomUserDetails;
import org.example.planlist.security.JwtTokenProvider;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // 🔑 회원가입 (비밀번호 암호화 후 저장)
    public void signup(UserSignupRequestDTO requestDto) {
        User user = new User();
        String defaultImage = "https://your-cdn.com/default-profile.png";

        user.setProfileImage(defaultImage);
        user.setEmail(requestDto.getEmail());
        user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        user.setName(requestDto.getName());
        userRepository.save(user);
    }

    // 🔐 로그인 (ID/PW 검증 후 JWT 발급)
    public UserLoginResponseDTO login(UserLoginRequestDTO requestDto) {
        User user = userRepository.findByEmail(requestDto.getEmail()).orElseThrow(()
                -> new UsernameNotFoundException("User not found with ID: " + requestDto.getEmail()));
        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }
        String token = jwtTokenProvider.createToken(user.getEmail());
        return new UserLoginResponseDTO(user.getEmail(), token);
    }

    @Transactional
    public void updatePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 사용자 정보 조회 (username 대신 email, userId 등도 가능)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        // UserDetails로 변환
        return new CustomUserDetails(user);
    }

    public void checkUser(String email) {
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            throw new GeneralException(ErrorStatus.USERNAME_ALREADY_EXISTS);
        }
    }



}
