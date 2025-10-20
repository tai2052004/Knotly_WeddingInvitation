package com.Services;

import com.Model.Designing_Template;
import com.Model.Template;
import com.Model.Users;
import com.Repositories.DesigningTemplateRepository;
import com.Repositories.TemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TemplateService {
    @Autowired
    public TemplateRepository templateRepository;

    // --- Inject Repository mới ---
    @Autowired
    public DesigningTemplateRepository designingTemplateRepository;

    // --- Các phương thức cũ cho Template ---
    public Template loadTemplate(int id) { // Giữ nguyên kiểu int nếu ID của bạn là int
        // Chuyển sang Long nếu ID thực sự là Long
        return templateRepository.findById(id).orElse(null);
    }

    public List<Template> loadAllTemplates() {
        return templateRepository.findAll();
    }

    // Phương thức này dùng để lưu Template CHÍNH THỨC (có thể dùng cho "Publish")
    public Template saveTemplate(Template template) {
        return templateRepository.save(template);
    }

    // --- Phương thức mới để xử lý bản nháp (Designing_Template) ---

    /**
     * Tìm bản nháp Designing_Template dựa trên User và Template gốc.
     * @param user User hiện tại
     * @param template Template gốc
     * @return Optional chứa bản nháp nếu tìm thấy
     */
//    public Designing_Template findDraft(Users user, Template template) {
//        // Giả sử DesigningTemplateRepository có phương thức findByUserAndTemplate
//        return designingTemplateRepository.findByUserAndTemplate(user, template);
//    }

    /**
     * Lưu hoặc cập nhật bản nháp Designing_Template.
     * @param draft Đối tượng Designing_Template cần lưu
     * @return Bản nháp đã được lưu
     */
    public Designing_Template saveOrUpdateDraft(Designing_Template draft) {
        // Có thể thêm logic kiểm tra quyền hạn ở đây
        return designingTemplateRepository.save(draft);
    }
}
