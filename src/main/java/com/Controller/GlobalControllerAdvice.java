package com.Controller; // Or your controller package

import com.Model.Users;
import com.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalControllerAdvice {

    @Autowired
    private UserRepository userRepository;

    /**
     * This method runs before every page load and adds the user
     * to the model as the variable "user".
     */
    @ModelAttribute("user")
    public Users addGlobalUserToModel() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String email = null;
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        }

        if (email != null) {
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    /**
     * --- ADD THIS METHOD ---
     * This adds the same user object to the model as "currentUser"
     * for your other pages like editDesign.
     */
    @ModelAttribute("currentUser")
    public Users addGlobalCurrentUserToModel() {
        // It just calls the other method so we don't duplicate code
        return addGlobalUserToModel();
    }
}