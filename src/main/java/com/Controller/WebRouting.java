package com.Controller;

import com.Model.Users;
import com.Repositories.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebRouting {

    private final UserRepository userRepository;

    public WebRouting(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/")
    public String home(Model model, HttpSession session,
                       @AuthenticationPrincipal OAuth2User oAuth2User) {

        Users user = null;

        if (oAuth2User != null) {
            // Người dùng đăng nhập bằng Google
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");

            user = userRepository.findByEmail(email).orElseGet(() -> {
                Users newUser = new Users();
                newUser.setEmail(email);
                newUser.setUsername(name);
                newUser.setRole(1);
                return userRepository.save(newUser);
            });

        } else {
            // Người dùng đăng nhập bằng form (database)
            user = (Users) session.getAttribute("loggedInUser");
        }

        model.addAttribute("user", user);
        return "landingPage";
    }

    @GetMapping("/editDesign")
    public String editDesign(Model model) {
        return "editDesign";
    }


    @GetMapping("/register")
    public String register(Model model) {
        return "register";
    }

    @GetMapping("/design")
    public String design(Model model) {
        return "design";
    }

    @GetMapping("/confirmWeeding")
    public String confirmWeeding(Model model) {
        return "confirmWeeding";
    }

    @GetMapping("/forgotPassword")
    public String forgotPassword(Model model) {
        return "forgotPassword";
    }

    @GetMapping("/resetPassword")
    public String resetPassword(Model model) {
        return "resetPassword";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        return "profile";
    }

    @GetMapping("/security")
    public String sercurity(Model model) {
        return "security";
    }
}
