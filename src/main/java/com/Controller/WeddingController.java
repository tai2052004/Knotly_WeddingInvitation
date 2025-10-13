package com.Controller;

import com.Model.Template;
import com.Services.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Controller
public class WeddingController {
    @Autowired
    public TemplateService templateService;
    @GetMapping("/confirmWeeding")
    public String showConfirmPage(@RequestParam("id") int templateId, Model model) {

        // Giờ bạn đã có biến `templateId` là một số Long
        System.out.println("Đã nhận được Template ID từ URL: " + templateId);

        // Bạn có thể dùng ID này để lấy thông tin từ database
         Template templateOptional = templateService.loadTemplate(templateId);
         if (templateOptional != null) {
             model.addAttribute("template", templateOptional);
         }

        // Trả về tên của file HTML (ví dụ: confirmWeeding.html)
        return "confirmWeeding";
    }
    @GetMapping("/Invitation")
    public String invitation(@RequestParam("id") int templateId, Model model) {

        // Giờ bạn đã có biến `templateId` là một số Long

        // Bạn có thể dùng ID này để lấy thông tin từ database
        Template templateOptional = templateService.loadTemplate(templateId);
        if (templateOptional != null) {
            model.addAttribute("template", templateOptional);
        }

        // Trả về tên của file HTML (ví dụ: confirmWeeding.html)
        return "Invitation";
    }
}
