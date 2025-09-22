package com.Services;

import com.Repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    public final UserRepository userRepository;

    public UserService(UserRepository userRepository ) {
        this.userRepository = userRepository;
    }

    public boolean login(String email, String password) {
        return userRepository.findByEmail(email)
                .map(users -> password.equals(users.getPassword()))
                .orElse(false);
    }
}
