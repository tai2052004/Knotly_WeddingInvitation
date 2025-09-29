package com.Controller;

import com.Model.Template;
import com.Services.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TemplateController {
    @Autowired
    public TemplateService templateService;

    @GetMapping("/template")
    public String template(Model model) {
        Template template = new Template();
        template = templateService.loadTemplate(1);
        model.addAttribute("template", template);
        return "editDesign";
    }
}
