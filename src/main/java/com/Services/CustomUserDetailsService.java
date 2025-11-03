package com.Services;

import com.Model.Users;
import com.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.ArrayList; // Import ArrayList

@Service // <-- This annotation makes it a bean that Spring can find
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Find the user in your database by their email
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // 2. Create a Spring Security 'User' object
        // We use user.getEmail() as the "username" for Spring Security
        // We use an empty list for roles/authorities for this demo
        return new User(user.getEmail(), user.getPassword(), new ArrayList<>());
    }
}