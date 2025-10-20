package com.Repositories;

import com.Model.Designing_Template;
import com.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

@Repository
public interface DesigningTemplateRepository extends JpaRepository<Designing_Template, Long> {

    // ... (các phương thức find... cũ giữ nguyên) ...
    Designing_Template findByUserIdAndTemplate_TemplateId(Long userId, Long templateId);
    Designing_Template findByUserIdAndTemplateIsNull(Long userId);
    Designing_Template findFirstByUserIdOrderByLastUpdatedDesc(Long userId);
    List<Designing_Template> findByUserOrderByLastUpdatedDesc(Users user);


    /**
     * Cập nhật trực tiếp CẢ 3 TRƯỜNG
     */
    // --- SỬA 1: Thêm "clearAutomatically = true" để xóa cache ---
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Designing_Template d " +
            // --- SỬA 2: Đảm bảo có dòng này ---
            "SET d.tempHtmlCode = :htmlCode, " +
            "    d.bodyStyle = :bodyStyle, " +
            "    d.bodyVideo = :bodyVideo, " +
            "    d.lastUpdated = :now " +
            "WHERE d.designingId = :designingId AND d.user.id = :userId")
    int updateDraftHtmlForUser(@Param("designingId") Long designingId,
                               // --- SỬA 3: Đảm bảo có tham số này ---
                               @Param("htmlCode") String htmlCode,
                               @Param("bodyStyle") String bodyStyle,
                               @Param("bodyVideo") String bodyVideo,
                               @Param("userId") Long userId,
                               @Param("now") LocalDateTime now);
}