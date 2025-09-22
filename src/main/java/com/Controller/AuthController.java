package com.Controller;

import com.Services.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // Show login page
    @GetMapping("/login")
    public String loginPage() {
        return "login"; // loads login.html
    }

    // Handle login form submission
    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password,
                        Model model) {

        boolean success = userService.login(email, password);

        if (success) {
            return "redirect:/"; // redirect to landingPage.html
        } else {
            model.addAttribute("error", "Invalid email or password");
            return "login"; // reload login page with error message
        }
    }
}
