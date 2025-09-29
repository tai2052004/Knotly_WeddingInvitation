document.addEventListener("DOMContentLoaded", () => {
    // Lấy các phần tử cần thiết
    const previewBtn = document.querySelector(".header .btn:nth-child(2)");
    const sidebar = document.querySelector(".sidebar");
    const header = document.querySelector(".header");
    const textToolbar = document.getElementById("floatingToolbar");
    // ### CODE MỚI: Lấy card toolbar ###
    const cardToolbar = document.getElementById("cardToolbar");


    let isFullscreen = false;

    // Hàm gắn sự kiện cho nút Preview
    function attachPreviewEvent() {
        if (previewBtn) {
            previewBtn.removeEventListener("click", enterFullscreen);
            previewBtn.addEventListener("click", enterFullscreen);
            console.log("Preview event attached");
        }
    }

    // Hàm vô hiệu hóa kéo thả, resize, và click
    function disableInteractions() {
        // Lấy lại các phần tử mỗi lần gọi
        const draggableElements = document.querySelectorAll(".draggable-text, .draggable-image, .draggable-video");
        const resizeHandles = document.querySelectorAll(".resize-handle");
        const confirmButtons = document.querySelectorAll(".draggable-button");
        // ### CODE MỚI: Lấy tất cả các card ###
        const cards = document.querySelectorAll(".card");

        // Vô hiệu hóa các element kéo thả thông thường
        draggableElements.forEach(el => {
            el.style.pointerEvents = "none";
            el.setAttribute("data-events-disabled", "true");
        });
        resizeHandles.forEach(handle => {
            handle.style.display = "none";
            handle.style.pointerEvents = "none";
        });
        confirmButtons.forEach(button => {
            button.style.pointerEvents = "none";
            button.style.userSelect = "none";
            const resizeHandle = button.querySelector(".resize-handle");
            if (resizeHandle) {
                resizeHandle.style.display = "none";
                resizeHandle.style.pointerEvents = "none";
            }
        });

        // Vô hiệu hóa map và address elements
        const miniMapWrap = document.getElementById("miniMapWrap");
        const addressTextEl = document.getElementById("miniMapAddress");
        const zoomBtnWrap = document.getElementById("zoomBtnWrap");

        if (miniMapWrap) miniMapWrap.style.pointerEvents = "none";
        if (addressTextEl) addressTextEl.style.pointerEvents = "none";
        if (zoomBtnWrap) zoomBtnWrap.style.display = "none";

        // ### CODE MỚI: Vô hiệu hóa card ###
        cards.forEach(card => {
            card.style.pointerEvents = "none"; // Tắt click
        });

        // Đảm bảo các element không ở trạng thái được chọn (sẽ ẩn tất cả toolbar)
        if (typeof hideToolbars === 'function') { // Sử dụng hàm mới từ editDesign.js
            hideToolbars();
        } else if (typeof hideToolbarAndDeselect === 'function') { // Fallback cho hàm cũ
            hideToolbarAndDeselect();
        }
    }

    function restoreInteractions() {
        const draggableElements = document.querySelectorAll(".draggable-text, .draggable-image, .draggable-video");
        const resizeHandles = document.querySelectorAll(".resize-handle");
        const confirmButtons = document.querySelectorAll(".draggable-button");
        // ### CODE MỚI: Lấy tất cả các card ###
        const cards = document.querySelectorAll(".card");

        // Khôi phục các element kéo thả thông thường
        draggableElements.forEach(el => {
            if (el.getAttribute("data-events-disabled") === "true") {
                el.style.pointerEvents = "";
                el.removeAttribute("data-events-disabled");
            }
        });
        resizeHandles.forEach(handle => {
            handle.style.pointerEvents = "";
        });
        confirmButtons.forEach(button => {
            button.style.pointerEvents = "";
            button.style.userSelect = "";
            button.style.cursor = "move";
            const resizeHandle = button.querySelector(".resize-handle");
            if (resizeHandle) {
                resizeHandle.style.pointerEvents = "";
            }
        });

        // Khôi phục map và address elements
        const miniMapWrap = document.getElementById("miniMapWrap");
        const addressTextEl = document.getElementById("miniMapAddress");
        const zoomBtnWrap = document.getElementById("zoomBtnWrap");

        if (miniMapWrap) miniMapWrap.style.pointerEvents = "";
        if (addressTextEl) addressTextEl.style.pointerEvents = "";
        if (zoomBtnWrap) zoomBtnWrap.style.display = "";

        // ### CODE MỚI: Khôi phục card ###
        cards.forEach(card => {
            card.style.pointerEvents = ""; // Mở lại click
        });
    }


    // Hàm kích hoạt chế độ fullscreen
    function enterFullscreen() {
        const confirmButtons = document.querySelectorAll(".draggable-button");
        if (!isFullscreen && previewBtn) {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(err => console.error("Fullscreen request failed:", err));
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }

            // Ẩn sidebar, header, và toolbars
            if (sidebar) sidebar.style.display = "none";
            if (header) header.style.display = "none";
            if (textToolbar) textToolbar.style.display = "none";
            // ### CODE MỚI: Ẩn card toolbar ###
            if (cardToolbar) cardToolbar.style.display = "none";


            // Vô hiệu hóa kéo thả, resize, và click
            disableInteractions();

            // Thiết lập sự kiện click cho confirm buttons
            confirmButtons.forEach(button => {
                button.style.cursor = "pointer";
                button.style.pointerEvents = "auto";
                button.dataset.href = "confirmWeeding";
                button.addEventListener("click", handleButtonClick);
            });

            isFullscreen = true;
            console.log("Entered fullscreen");
        }
    }

    // Hàm xử lý click vào confirm button
    function handleButtonClick(e) {
        if (isFullscreen && e.target.dataset.href) {
            e.preventDefault();
            window.open(e.target.dataset.href, "_blank");
            console.log("Confirm button clicked, opened new tab");
        }
    }

    // Hàm thoát chế độ fullscreen
    function exitFullscreen() {
        const confirmButtons = document.querySelectorAll(".draggable-button");
        if (isFullscreen) {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(err => console.error("Exit fullscreen failed:", err));
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }

            // Hiển thị lại sidebar, header
            if (sidebar) sidebar.style.display = "block";
            if (header) header.style.display = "flex";
            // Toolbar sẽ tự động ẩn/hiện khi chọn element, không cần set ở đây

            // Khôi phục kéo thả, resize, và click
            restoreInteractions();

            // Vô hiệu hóa sự kiện của confirm buttons
            confirmButtons.forEach(button => {
                button.style.cursor = "move";
                button.removeEventListener("click", handleButtonClick);
                delete button.dataset.href;
            });

            isFullscreen = false;
            attachPreviewEvent();
            console.log("Exited fullscreen, reattached Preview event");
        }
    }

    // Khởi tạo gắn sự kiện
    attachPreviewEvent();

    // Gắn sự kiện keydown để thoát fullscreen khi bấm ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isFullscreen) {
            exitFullscreen();
        }
    });

    // Xử lý khi trình duyệt tự thoát fullscreen
    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement && isFullscreen) {
            exitFullscreen();
        }
    });
    document.addEventListener("webkitfullscreenchange", () => {
        if (!document.webkitFullscreenElement && isFullscreen) {
            exitFullscreen();
        }
    });
    document.addEventListener("msfullscreenchange", () => {
        if (!document.msFullscreenElement && isFullscreen) {
            exitFullscreen();
        }
    });
});