package com.Services; // Or your service package

import com.Model.Users;
import com.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID; // Import the UUID class

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            logger.error("OAuth2 user email is null. Cannot process login.");
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<Users> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            // 1. USER ALREADY EXISTS (This is good)
            logger.info("OAuth2 Login: User found in database with email: {}", email);
        } else {
            // 2. USER NOT FOUND - CREATE THEM
            logger.warn("OAuth2 Login: No user found with email {}. Creating new user...", email);

            Users newUser = new Users();
            newUser.setEmail(email);
            newUser.setRole(1);
            newUser.setPassword(null); // No password for OAuth users

            // --- Robust Username Generation ---
            String username = null;

            // Try to use Google 'name' first
            if (name != null && !name.isBlank() && userRepository.findByUsername(name).isEmpty()) {
                username = name;
            }

            // If name is null, blank, or taken, try email prefix
            if (username == null) {
                String emailPrefix = email.split("@")[0];
                if (userRepository.findByUsername(emailPrefix).isEmpty()) {
                    username = emailPrefix;
                }
            }

            // If email prefix is ALSO taken, generate a random username
            if (username == null) {
                do {
                    username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5);
                } while (userRepository.findByUsername(username).isPresent());
                logger.info("Username was taken, using randomly generated username: {}", username);
            }
            // --- End Robust Username Generation ---

            newUser.setUsername(username);

            // 3. TRY TO SAVE
            try {
                userRepository.save(newUser);
                logger.info("Successfully saved new OAuth2 user: {}. Email: {}", username, email);
            } catch (Exception e) {
                // This catch is crucial
                logger.error("!!! CRITICAL: FAILED to save new OAuth2 user: " + e.getMessage(), e);

                // Create an error object
                OAuth2Error error = new OAuth2Error("DATABASE_SAVE_ERROR", "Failed to save new user: " + e.getMessage(), null);

                // Pass the error and the original exception
                throw new OAuth2AuthenticationException(error, e);
            }
        }

        return oAuth2User;
    }
}