package com.Controller;

import com.Model.DTO.TemplateDto;
import com.Model.Template;
import com.Services.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/templates")
public class TemplateController {
    @Autowired
    public TemplateService templateService;


    @PostMapping
    public ResponseEntity<Template> createTemplate(@RequestBody TemplateDto templateDto) {
        // KIỂM TRA DỮ LIỆU ĐẦU VÀO
        if (templateDto == null || templateDto.getHtmlCode() == null) {
            // Trả về lỗi 400 Bad Request nếu dữ liệu không hợp lệ
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            Template newTemplate = new Template();
            newTemplate.setHtmlCode(templateDto.getHtmlCode());
            Template savedTemplate = templateService.saveTemplate(newTemplate);
            return new ResponseEntity<>(savedTemplate, HttpStatus.CREATED);
        } catch (Exception e) {
            // In lỗi ra console để debug
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Template> updateTemplate(@PathVariable("id") int id, @RequestBody TemplateDto templateDto) {
        // KIỂM TRA DỮ LIỆU ĐẦU VÀO
        if (templateDto == null || templateDto.getHtmlCode() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Template templateData = templateService.loadTemplate(id);

        if (templateData != null) {
            templateData.setHtmlCode(templateDto.getHtmlCode());
            Template updatedTemplate = templateService.saveTemplate(templateData);
            return new ResponseEntity<>(updatedTemplate, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
