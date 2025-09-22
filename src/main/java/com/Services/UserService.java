package com.Services;

import com.Model.Users;
import com.Repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    public final UserRepository userRepository;

    public UserService(UserRepository userRepository ) {
        this.userRepository = userRepository;
    }


    public Users authenticate(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(users -> password.equals(users.getPassword()))
                .orElse(null);
    }
}
