document.addEventListener("DOMContentLoaded", () => {
    // Lấy các phần tử cần thiết
    const previewBtn = document.querySelector(".header .btn:nth-child(2)"); // Nút Preview
    const sidebar = document.querySelector(".sidebar");
    const header = document.querySelector(".header");
    const textToolbar = document.getElementById("floatingToolbar");
    const cardToolbar = document.getElementById("cardToolbar");
    const canvas = document.querySelector('.canvas'); // Thêm canvas để làm việc

    let isPreviewMode = false;

    // Hàm vô hiệu hóa các tương tác trong chế độ chỉnh sửa
    function disableEditorInteractions() {
        // Vô hiệu hóa tất cả các phần tử có thể kéo thả
        canvas.querySelectorAll(".draggable-text, .draggable-image, .draggable-video, .draggable-button, .draggable-qrcode, .card").forEach(el => {
            el.style.pointerEvents = "none"; // Tắt tất cả các sự kiện chuột
        });

        // Ẩn tất cả resize handles
        canvas.querySelectorAll(".resize-handle").forEach(handle => {
            handle.style.display = "none";
        });

        // Đảm bảo các toolbar đều bị ẩn
        if (typeof hideToolbars === 'function') {
            hideToolbars();
        }
    }

    // Hàm khôi phục các tương tác trong chế độ chỉnh sửa
    function restoreEditorInteractions() {
        canvas.querySelectorAll(".draggable-text, .draggable-image, .draggable-video, .draggable-button, .draggable-qrcode, .card").forEach(el => {
            el.style.pointerEvents = ""; // Mở lại sự kiện chuột
        });

        // Việc hiển thị lại resize handle sẽ được quản lý bởi hàm selectElement khi người dùng click
    }

    // Hàm kích hoạt các liên kết cho chế độ xem trước
    function activatePreviewLinks() {
        const clickableElements = canvas.querySelectorAll('[data-link], [data-url]');

        clickableElements.forEach(element => {
            const link = element.dataset.link || element.dataset.url;
            if (link) {
                element.style.pointerEvents = "auto"; // Cho phép click vào phần tử này
                element.style.cursor = "pointer";
                element.addEventListener("click", handleLinkClick);
            }
        });
    }

    // Hàm vô hiệu hóa các liên kết khi thoát xem trước
    function deactivatePreviewLinks() {
        const clickableElements = canvas.querySelectorAll('[data-link], [data-url]');

        clickableElements.forEach(element => {
            element.style.cursor = ""; // Trả lại con trỏ mặc định (thường là 'move')
            element.removeEventListener("click", handleLinkClick);
        });
    }

    // Hàm xử lý khi click vào một liên kết trong chế độ xem trước
    function handleLinkClick(e) {
        // Chỉ hoạt động khi ở chế độ xem trước
        if (!isPreviewMode) return;

        e.preventDefault();
        e.stopPropagation();

        const link = e.currentTarget.dataset.link || e.currentTarget.dataset.url;
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaa",link);
        if (link) {
            window.open(link, "_blank");
            console.log("Đã mở link trong tab mới:", link);
        }
    }

    // Hàm chính: Bật chế độ xem trước
    function enterPreviewMode() {
        if (isPreviewMode) return;

        const elem = document.documentElement;
        // Bật chế độ toàn màn hình
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.error("Lỗi khi bật toàn màn hình:", err));
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }

        // Ẩn các giao diện của trình chỉnh sửa
        if (sidebar) sidebar.style.display = "none";
        if (header) header.style.display = "none";

        // Vô hiệu hóa các tương tác chỉnh sửa
        disableEditorInteractions();

        // Kích hoạt các link
        activatePreviewLinks();

        isPreviewMode = true;
        console.log("Đã vào chế độ xem trước.");
    }

    // Hàm chính: Thoát chế độ xem trước
    function exitPreviewMode() {
        if (!isPreviewMode) return;

        // Thoát chế độ toàn màn hình
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.error("Lỗi khi thoát toàn màn hình:", err));
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        // Hiển thị lại giao diện trình chỉnh sửa
        if (sidebar) sidebar.style.display = "block";
        if (header) header.style.display = "flex";

        // Vô hiệu hóa các link
        deactivatePreviewLinks();

        // Khôi phục các tương tác chỉnh sửa
        restoreEditorInteractions();

        isPreviewMode = false;
        console.log("Đã thoát chế độ xem trước.");
    }

    // Gắn sự kiện cho nút Preview
    if (previewBtn) {
        previewBtn.addEventListener("click", enterPreviewMode);
    }

    // Lắng nghe sự kiện thoát fullscreen (ví dụ: bấm phím ESC)
    document.addEventListener("fullscreenchange", () => {
        // Nếu không còn phần tử nào ở chế độ fullscreen và chúng ta đang ở chế độ preview
        if (!document.fullscreenElement && isPreviewMode) {
            exitPreviewMode();
        }
    });

    // Các trình duyệt khác
    document.addEventListener("webkitfullscreenchange", () => {
        if (!document.webkitFullscreenElement && isPreviewMode) {
            exitPreviewMode();
        }
    });
    document.addEventListener("msfullscreenchange", () => {
        if (!document.msFullscreenElement && isPreviewMode) {
            exitPreviewMode();
        }
    });
});