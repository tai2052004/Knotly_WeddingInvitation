package com.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebRouting {
    @GetMapping("/")
    public String home(Model model) {
        return "landingPage";
    }

    @GetMapping("/editDesign")
    public String editDesign(Model model) {
        return "editDesign";
    }


    @GetMapping("register")
    public String register(Model model) {
        return "register";
    }

    @GetMapping("design")
    public String design(Model model) {
        return "design";
    }

    @GetMapping("confirmWeeding")
    public String confirmWeeding(Model model) {
        return "confirmWeeding";
    }

    @GetMapping("forgotPassword")
    public String forgotPassword(Model model) {
        return "forgotPassword";
    }

    @GetMapping("resetPassword")
    public String resetPassword(Model model) {
        return "resetPassword";
    }

    @GetMapping("profile")
    public String profile(Model model) {
        return "profile";
    }

    @GetMapping("security")
    public String sercurity(Model model) {
        return "security";
    }
}
