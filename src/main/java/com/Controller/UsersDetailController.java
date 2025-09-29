package com.Controller;

import com.Model.Users;
import com.Model.UsersDetail;
import com.Repositories.UserRepository;
import com.Repositories.UsersDetailRepository;
import com.Services.UsersDetailService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;

@Controller
public class UsersDetailController {
    @Autowired
    private UsersDetailService usersDetailService;
    private UsersDetailRepository repos;
    private UserRepository userRepository;

    public UsersDetailController(UsersDetailService usersDetailService, UsersDetailRepository repos, UserRepository userRepository) {
        this.usersDetailService = usersDetailService;
        this.repos = repos;
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public String profile(Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        Users user = (Users) session.getAttribute("loggedInUser");
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "Session expired. Please login again.");
            return "redirect:/landingPage";
        }
        UsersDetail userDetail = usersDetailService.getDetailByUserId(user.getId());
        model.addAttribute("user", user);
        model.addAttribute("userDetail", userDetail);
        return "profile";
    }

    @PostMapping("/profile")
    public String updateProfile(@RequestParam String name, @RequestParam String email, @RequestParam String phone, @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date birthday,
                                HttpSession session, RedirectAttributes redirectAttributes) {
        Users user = (Users) session.getAttribute("loggedInUser");
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "User not logged in!");
            return "redirect:/landingPage";
        }

        // Lấy thông tin user detail hiện tại
        UsersDetail userDetail = usersDetailService.getDetailByUserId(user.getId());
        if (userDetail != null) {
            userDetail.setName(name);
            userDetail.setPhone(phone);
            userDetail.setBirthday(birthday);
            repos.save(userDetail);
        }
        redirectAttributes.addFlashAttribute("success", "Edit Profile Successfully!");
        return "redirect:/profile";
    }

    @GetMapping("/security")
    public String changePassword(Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        Users user = (Users) session.getAttribute("loggedInUser");
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "Session expired. Please login again.");
            return "redirect:/landingPage";
        }

        UsersDetail userDetail = usersDetailService.getDetailByUserId(user.getId());
        model.addAttribute("user", user);
        model.addAttribute("userDetail", userDetail);
        return "security";
    }

    @PostMapping("/security")
    public String changePassword(@RequestParam String currentPassword, @RequestParam String newPassword, @RequestParam String confirmPassword, Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        Users user = (Users) session.getAttribute("loggedInUser");
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "Session expired. Please login again.");
            return "redirect:/landingPage";
        }

        if (!user.getPassword().equals(currentPassword)) {
            redirectAttributes.addFlashAttribute("error", "Old password not correct!");
            model.addAttribute("confirmPassword", confirmPassword);
            model.addAttribute("newPassword", newPassword);
            return "security";
        }

        if (!newPassword.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("error", "Confirm new password do not match!");
            model.addAttribute("confirmPassword", confirmPassword);
            model.addAttribute("newPassword", newPassword);
            return "security";
        }
        user.setPassword(newPassword);
        userRepository.save(user);
        redirectAttributes.addFlashAttribute("success", "Password changed successfully!");
        return "redirect:/security";
    }

    @PostMapping("/update-avatar")
    public String updateAvatar(@RequestParam("avatar") MultipartFile file, RedirectAttributes redirectAttributes, HttpSession session) {
        try {
            if (file.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "No file selected!");
                return "redirect:/profile";
            }

            // Tạo tên file duy nhất
            String uploadDir = new ClassPathResource("static/image/").getFile().getAbsolutePath();
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir, filename);
            file.transferTo(path);

            Users user = (Users) session.getAttribute("user");
            usersDetailService.updateUserAvatar(user.getId(), filename);

            UsersDetail updatedDetail = usersDetailService.getDetailByUserId(user.getId());
            session.setAttribute("userDetail", updatedDetail);

            redirectAttributes.addFlashAttribute("success", "Avatar updated successfully!");
        } catch (IOException e) {
            redirectAttributes.addFlashAttribute("error", "Failed to upload avatar.");
            return "redirect:/profile";
        }
        return "redirect:/profile";
    }
}
