package com.Controller;

import com.Model.Users;
import com.Services.UserService;
import jakarta.servlet.http.HttpSession;
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
                        Model model, HttpSession session) {

        Users user = userService.authenticate(email, password);

        if (user != null) {
            session.setAttribute("loggedInUser", user);
            return "redirect:/"; // redirect to landingPage.html
        } else {
            model.addAttribute("error", "Invalid email or password");
            return "login"; // reload login page with error message
        }
    }
    // logout
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate(); // clear session
        return "redirect:/";
    }

}
