package org.example.planlist.service.user;

import org.example.planlist.apiPayload.code.ErrorStatus;
import org.example.planlist.apiPayload.exception.GeneralException;
import org.example.planlist.entity.User;
import org.example.planlist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordCheckService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;
    
    public void checkPassword(User user, String rawPassword) {
        boolean match = passwordEncoder.matches(rawPassword, user.getPassword());
        if (!match) {
            throw new GeneralException(ErrorStatus.PASSWORD_MISMATCH);
        }
    }

    public void checkNewPassword(String newPassword, String confirmPassword) {

        if (!newPassword.equals(confirmPassword)) {
            throw new GeneralException(ErrorStatus.PASSWORD_CONFIRM_MISMATCH);
        }
    }

}
