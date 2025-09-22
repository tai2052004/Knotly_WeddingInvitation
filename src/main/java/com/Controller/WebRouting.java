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
}
