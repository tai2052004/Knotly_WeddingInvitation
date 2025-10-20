package com.Services;

import com.Model.Designing_Template;
import com.Model.Template;
import com.Model.Users;
import com.Repositories.DesigningTemplateRepository;
import com.Repositories.TemplateRepository;
import com.Repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DesigningTemplateService {

    @Autowired
    private DesigningTemplateRepository designingTemplateRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TemplateRepository templateRepository;

    // (Giữ nguyên các hàm find... và loadDraftById...)
    @Transactional(readOnly = true)
    public Designing_Template loadDraftById(Long designingId) {
        if (designingId == null || designingId <= 0) {
            return null;
        }
        return designingTemplateRepository.findById(designingId).orElse(null);
    }
    public Designing_Template findDraftByUserIdAndTemplateId(Long userId, Integer templateId) {
        if (userId == null) { return null; }
        if (templateId != null && templateId > 0) {
            return designingTemplateRepository.findByUserIdAndTemplate_TemplateId(userId, (long)templateId);
        } else {
            return designingTemplateRepository.findByUserIdAndTemplateIsNull(userId);
        }
    }
    public Designing_Template findLatestDraftByUserId(Long userId) {
        if (userId == null) { return null; }
        return designingTemplateRepository.findFirstByUserIdOrderByLastUpdatedDesc(userId);
    }


    /**
     * [SỬA] Cập nhật tempHtmlCode, bodyStyle, bodyVideo dùng @Query
     */
    @Transactional
    public Designing_Template updateDraftHtmlById(Long designingId, String htmlCode, String bodyStyle, String bodyVideo, Long userId) {

        if (designingId == null || htmlCode == null || userId == null) {
            throw new IllegalArgumentException("DesigningId, htmlCode, and userId cannot be null");
        }

        // 1. Gọi query @Modifying đã sửa (đảm bảo truyền đủ 4 tham số)
        int affectedRows = designingTemplateRepository.updateDraftHtmlForUser(
                designingId,
                htmlCode,  // Tham số htmlCode
                bodyStyle,
                bodyVideo,
                userId,
                LocalDateTime.now()
        );

        // 2. Kiểm tra
        if (affectedRows == 0) {
            boolean draftExists = designingTemplateRepository.existsById(designingId);
            if (!draftExists) {
                throw new EntityNotFoundException("Draft not found with ID: " + designingId);
            } else {
                throw new SecurityException("User " + userId + " does not have permission to update draft " + designingId);
            }
        }

        // 3. Trả về entity đã cập nhật
        // (Vì đã có clearAutomatically=true, findById sẽ đọc từ DB)
        return designingTemplateRepository.findById(designingId)
                .orElseThrow(() -> new EntityNotFoundException("Draft not found with ID: " + designingId + " after successful update"));
    }


    /**
     * Phương thức "Tạo Mới / Upsert" (Đã đúng logic)
     */
    @Transactional
    public Designing_Template saveOrUpdateDraftWithIds(Long userId, Integer templateId, String htmlCode, String bodyStyle, String bodyVideo) {
        if (userId == null || htmlCode == null) {
            throw new IllegalArgumentException("UserId and htmlCode cannot be null");
        }

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        Template template = null;
        Designing_Template draft = null;

        if (templateId != null && templateId > 0) {
            // TRƯỜNG HỢP 1: Có Template ID Gốc (e.g., /edit-design/123)
            template = templateRepository.findById(templateId)
                    .orElseThrow(() -> new EntityNotFoundException("Template not found with ID: " + templateId));
            draft = designingTemplateRepository.findByUserIdAndTemplate_TemplateId(userId, (long)templateId);
        } else {
            // TRƯỜNG HỢP 2: KHÔNG có Template ID (e.g., /edit-design/0)
            draft = null;
        }

        if (draft == null) {
            // Tạo mới
            draft = new Designing_Template();
            draft.setUser(user);
            draft.setTemplate(template);
        }

        // Cập nhật dữ liệu
        draft.setTempHtmlCode(htmlCode);
        draft.setBodyStyle(bodyStyle);
        draft.setBodyVideo(bodyVideo);
        draft.setLastUpdated(LocalDateTime.now());

        return designingTemplateRepository.save(draft);
    }

    // ... (Các phương thức deleteDraft... giữ nguyên) ...
}