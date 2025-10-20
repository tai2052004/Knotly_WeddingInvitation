package com.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "DESIGNING_TEMPLATES")
public class Designing_Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "designing_id")
    private Long designingId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = true)
    private Template template;

    @Lob
    @Column(name = "temp_html_code", columnDefinition = "TEXT")
    private String tempHtmlCode;

    @Column(name = "last_updated", columnDefinition = "DATETIME")
    private LocalDateTime lastUpdated;

    // --- THÊM MỚI ---
    @Lob // Dùng @Lob hoặc @Column(columnDefinition = "TEXT")
    @Column(name = "body_style")
    private String bodyStyle;

    @Lob
    @Column(name = "body_video")
    private String bodyVideo;
    // --- KẾT THÚC THÊM MỚI ---

    public Designing_Template() {
        this.lastUpdated = LocalDateTime.now();
    }

    // --- GETTERS & SETTERS (Giữ nguyên cái cũ) ---
    public Long getDesigningId() { return designingId; }
    public void setDesigningId(Long designingId) { this.designingId = designingId; }
    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }
    public Template getTemplate() { return template; }
    public void setTemplate(Template template) { this.template = template; }
    public String getTempHtmlCode() { return tempHtmlCode; }
    public void setTempHtmlCode(String tempHtmlCode) { this.tempHtmlCode = tempHtmlCode; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    // --- THÊM GETTERS & SETTERS MỚI ---
    public String getBodyStyle() { return bodyStyle; }
    public void setBodyStyle(String bodyStyle) { this.bodyStyle = bodyStyle; }
    public String getBodyVideo() { return bodyVideo; }
    public void setBodyVideo(String bodyVideo) { this.bodyVideo = bodyVideo; }

    // (Đã gỡ bỏ @PreUpdate)
}