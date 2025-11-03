package com.Controller;

import com.Model.Template;
import com.Model.Users;
import com.Services.TemplateService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;

@Controller
public class WebRouting {
    @Autowired
    public TemplateService templateService;
    @GetMapping("/")
    public String home() {

        return "landingPage";
    }

    @GetMapping("/editDesign")
    public String editDesign() {

        return "editDesign";
    }


    @GetMapping("/register")
    public String register(Model model) {
        return "register";
    }

    @GetMapping("/design")
    public String design(Model model) {
        List<Template> templateList = new ArrayList<Template>();
        templateList = templateService.loadAllTemplates();
        model.addAttribute("templateList", templateList);
        return "design";
    }
    @GetMapping("/completeTemplate")
    public String cT(@RequestParam("template_id") int templateId, Model model) {
        Template template = new Template();
        template = templateService.loadTemplate(templateId);
        System.out.println(template.getHtmlCode());
        model.addAttribute("template", template);
        return "complete_template";
    }
    @GetMapping("/template")
    public String template(@RequestParam("design_template_id") int designId, Model model) {
        model.addAttribute("designId", designId);

        return "editDesign";
    }
    @GetMapping("/forgotPassword")
    public String forgotPassword(Model model) {
        return "forgotPassword";
    }

    @GetMapping("/resetPassword")
    public String resetPassword(Model model) {
        return "resetPassword";
    }

}
