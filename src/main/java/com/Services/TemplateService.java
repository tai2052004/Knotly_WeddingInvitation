package com.Services;

import com.Model.Template;
import com.Repositories.TemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TemplateService {
    @Autowired
    public TemplateRepository templateRepository;

    public Template loadTemplate(int id) {
        return templateRepository.findById(id).orElse(null);
    }

    public List<Template> loadAllTemplates() {
        return templateRepository.findAll();
    }
}
