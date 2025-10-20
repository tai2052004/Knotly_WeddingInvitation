package com.Controller;

import com.Model.Designing_Template;
import com.Model.Template;
import com.Model.Users;
import com.Services.DesigningTemplateService;
import com.Services.TemplateService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class DesigningTemplateController {

    @Autowired
    private DesigningTemplateService designingTemplateService;

    @Autowired
    private TemplateService templateService;

    // --- Phương thức tải trang (GET) ĐÃ SỬA LOGIC (Tạo mới) ---
    @GetMapping("/edit-design/{templateId}")
    public String showEditPage(
            @PathVariable("templateId") int templateId,
            Model model,
            HttpSession session) {

        Users currentUser = (Users) session.getAttribute("loggedInUser");
        if (currentUser == null) { return "redirect:/login"; }
        model.addAttribute("currentUser", currentUser);

        Template templateBase = null;
        boolean isNewDesign = (templateId <= 0);

        if (!isNewDesign) {
            templateBase = templateService.loadTemplate(templateId);
            if (templateBase == null) { return "error/404"; }
            model.addAttribute("templateBase", templateBase);
        } else {
            model.addAttribute("templateBase", null);
        }

        Template displayTemplate = new Template();
        boolean loadedFromDraft = false;
        Long designingId = null;
        String bodyStyle = "";
        String bodyVideo = "";

        Designing_Template draftToLoad = null;

        if (!isNewDesign) {
            // SỬA template CŨ (ID > 0) -> tìm bản nháp cho template ĐÓ
            draftToLoad = designingTemplateService.findDraftByUserIdAndTemplateId(currentUser.getId(), templateId);
        } else {
            // TẠO template MỚI (ID <= 0) -> KHÔNG TẢI GÌ CẢ
            draftToLoad = null;
        }

        if (draftToLoad != null) {
            // Tải bản nháp
            displayTemplate.setHtmlCode(draftToLoad.getTempHtmlCode());
            designingId = draftToLoad.getDesigningId();
            bodyStyle = draftToLoad.getBodyStyle();
            bodyVideo = draftToLoad.getBodyVideo();
            loadedFromDraft = true;
            System.out.println("Loading DRAFT (ID: " + designingId + ") for template ID: " + templateId);
        }

        if (!loadedFromDraft) {
            // Tải trang trắng (cho design mới) hoặc tải từ template gốc
            displayTemplate.setHtmlCode(templateBase != null ? templateBase.getHtmlCode() : "<div class='card' id='card'><p>Start Designing</p></div>");
            designingId = null; // Đảm bảo ID là null
            bodyStyle = "";
            bodyVideo = "";
            System.out.println("Loading BLANK SLATE for " + (isNewDesign ? "new design" : "template ID: " + templateId));
        }

        model.addAttribute("template", displayTemplate);
        model.addAttribute("designId", designingId);
        model.addAttribute("bodyStyle", bodyStyle);
        model.addAttribute("bodyVideo", bodyVideo);

        return "editDesign";
    }

    // --- SỬA LỖI Ở ĐÂY: Phương thức lưu (PUT) ---
    @PutMapping("/designing-templates")
    @ResponseBody
    public ResponseEntity<?> saveOrUpdateDraft(
            @RequestBody Map<String, Object> payload,
            HttpSession session
    ) {
        Users currentUser = (Users) session.getAttribute("loggedInUser");
        if (currentUser == null) {
            return new ResponseEntity<>("User not logged in. Please login again.", HttpStatus.UNAUTHORIZED);
        }

        // --- SỬA 1: Đọc cả 3 trường từ payload ---
        String htmlCode = (String) payload.get("htmlCode");
        String bodyStyle = (String) payload.get("bodyStyle");
        String bodyVideo = (String) payload.get("bodyVideo");

        Object templateIdObj = payload.get("templateId");
        Object designingIdObj = payload.get("designingId");

        // (Code parse ID giữ nguyên)
        Integer templateId = null;
        if (templateIdObj instanceof Number) {
            templateId = ((Number) templateIdObj).intValue();
        } else if (templateIdObj != null && !templateIdObj.toString().isEmpty()) {
            try { templateId = Integer.parseInt(templateIdObj.toString()); }
            catch (NumberFormatException e) { /* để là null */ }
        }
        Long designingId = null;
        if (designingIdObj instanceof Number) {
            designingId = ((Number) designingIdObj).longValue();
        } else if (designingIdObj != null && !designingIdObj.toString().isEmpty()) {
            try { designingId = Long.parseLong(designingIdObj.toString()); }
            catch (NumberFormatException e) { /* để là null */ }
        }

        if (htmlCode == null) {
            return new ResponseEntity<>("htmlCode cannot be null", HttpStatus.BAD_REQUEST);
        }

        try {
            Designing_Template savedDraft;

            // TRƯỜNG HỢP 1: CẬP NHẬT (Có designingId)
            if (designingId != null && designingId > 0) {
                System.out.println("Attempting to UPDATE draft by designingId: " + designingId);
                // --- SỬA 2: Truyền cả 3 trường vào service ---
                savedDraft = designingTemplateService.updateDraftHtmlById(
                        designingId, htmlCode, bodyStyle, bodyVideo, currentUser.getId()
                );
            }
            // TRƯỜNG HỢP 2: TẠO MỚI (Không có designingId)
            else {
                System.out.println("Attempting to UPSERT/CREATE draft by (userId, templateId): (" + currentUser.getId() + ", " + templateId + ")");
                // --- SỬA 3: Truyền cả 3 trường vào service ---
                savedDraft = designingTemplateService.saveOrUpdateDraftWithIds(
                        currentUser.getId(), templateId, htmlCode, bodyStyle, bodyVideo
                );
            }

            return new ResponseEntity<>(savedDraft, HttpStatus.OK);

        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            // (Đã sửa lỗi typo "Example:")
            return new ResponseEntity<>("Error saving draft: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}