package com.Controller;

import com.Model.Designing_Template;
import com.Services.DesigningTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class WeddingController {

    @Autowired
    public DesigningTemplateService designingTemplateService;

    @GetMapping("/confirmWeeding")
    public String showConfirmPage(@RequestParam("id") Long designingId, Model model) {

        System.out.println("Đã nhận được Designing ID từ URL: " + designingId);
        Designing_Template draft = designingTemplateService.loadDraftById(designingId);


        if (draft != null) {
            System.out.println("Draft đã đc tìm thấy : " + draft.getDesigningId());
            // --- SỬA LỖI 500: THÊM LẠI DÒNG NÀY ---
            model.addAttribute("designDraft", draft);
            // ------------------------------------

            // (Kiểm tra null để đảm bảo an toàn cho bodyStyle/bodyVideo)
            model.addAttribute("templateHtmlCode", draft.getTempHtmlCode() != null ? draft.getTempHtmlCode() : "");
            model.addAttribute("bodyStyle", draft.getBodyStyle() != null ? draft.getBodyStyle() : "");
            model.addAttribute("bodyVideo", draft.getBodyVideo() != null ? draft.getBodyVideo() : "");

        } else {
            // TRƯỜNG HỢP ID KHÔNG TỒN TẠI (Để trang không bị sập)
            model.addAttribute("templateHtmlCode", "<div style='text-align: center; padding: 40px; font-family: sans-serif; color: #888;'><h2>Lỗi: Không tìm thấy thiết kế.</h2></div>");
            model.addAttribute("bodyStyle", "background-color: #f5f5f5;");
            model.addAttribute("bodyVideo", "");
        }

        return "confirmWeeding";
    }

    @GetMapping("/Invitation")
    public String invitation(@RequestParam("id") Long designingId, Model model) {

        System.out.println("Đã nhận được Designing ID từ URL: " + designingId);
        Designing_Template draft = designingTemplateService.loadDraftById(designingId);

        if (draft != null) {
            // --- SỬA LỖI 500: THÊM LẠI DÒNG NÀY ---
            model.addAttribute("designDraft", draft);
            // ------------------------------------

            model.addAttribute("templateHtmlCode", draft.getTempHtmlCode() != null ? draft.getTempHtmlCode() : "");
            model.addAttribute("bodyStyle", draft.getBodyStyle() != null ? draft.getBodyStyle() : "");
            model.addAttribute("bodyVideo", draft.getBodyVideo() != null ? draft.getBodyVideo() : "");

        } else {
            // TRƯỜNG HỢP ID KHÔNG TỒN TẠI
            model.addAttribute("designDraft", null); // Thêm vào để an toàn
            model.addAttribute("templateHtmlCode", "<div style='text-align: center; padding: 40px; font-family: sans-serif; color: #888;'><h2>Lỗi: Không tìm thấy thiệp mời.</h2></div>");
            model.addAttribute("bodyStyle", "background-color: #f5f5f5;");
            model.addAttribute("bodyVideo", "");
        }

        return "Invitation";
    }
}