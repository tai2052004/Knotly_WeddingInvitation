package com.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TEMPLATES")
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "template_name", nullable = true, length = 255)
    private String templateName;

    @Column(name = "html_code", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String htmlCode;

    @Column(name = "html_image", nullable = false, columnDefinition = "NVARCHAR(200)")
    private String htmlImage;

    @Column(name = "created_at", updatable = false, insertable = false,
            columnDefinition = "DATETIME DEFAULT GETDATE()")
    private LocalDateTime createdAt;

    // --- Constructors ---
    public Template() {
    }

    public Template(String templateName, String htmlCode) {
        this.templateName = templateName;
        this.htmlCode = htmlCode;
    }

    // --- Getters & Setters ---
    public Long getTemplateId() {
        return templateId;
    }



    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getHtmlCode() {
        return htmlCode;
    }

    public String getHtmlImage() {
        return htmlImage;
    }

    public void setHtmlImage(String htmlImage) {
        this.htmlImage = htmlImage;
    }

    public void setHtmlCode(String htmlCode) {
        this.htmlCode = htmlCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
