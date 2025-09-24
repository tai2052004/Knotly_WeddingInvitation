document.addEventListener("DOMContentLoaded", () => {
    // Lấy các phần tử cần thiết
    const previewBtn = document.querySelector(".header .btn:nth-child(2)");
    const sidebar = document.querySelector(".sidebar");
    const header = document.querySelector(".header");
    const toolbar = document.getElementById("floatingToolbar");

    let isFullscreen = false;

    // Hàm gắn sự kiện cho nút Preview
    function attachPreviewEvent() {
        if (previewBtn) {
            previewBtn.removeEventListener("click", enterFullscreen); // Gỡ sự kiện cũ
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

        draggableElements.forEach(el => {
            el.style.pointerEvents = "none";
            const existingEvents = el.getAttribute("data-events-disabled");
            if (!existingEvents) {
                el.setAttribute("data-events-disabled", "true");
            }
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
    }

    function restoreInteractions() {
        const draggableElements = document.querySelectorAll(".draggable-text, .draggable-image, .draggable-video");
        const resizeHandles = document.querySelectorAll(".resize-handle");
        const confirmButtons = document.querySelectorAll(".draggable-button");

        draggableElements.forEach(el => {
            if (el.getAttribute("data-events-disabled") === "true") {
                el.style.pointerEvents = "";
                el.removeAttribute("data-events-disabled");
            }
        });
        resizeHandles.forEach(handle => {
            handle.style.pointerEvents = "";
            const parent = handle.parentElement;
            if (parent && (parent.classList.contains("draggable-text") || parent.classList.contains("draggable-image") || parent.classList.contains("draggable-video") || parent.classList.contains("draggable-button"))) {
                handle.style.display = "block";
            }
        });
        confirmButtons.forEach(button => {
            button.style.pointerEvents = ""; // Restore pointer events
            button.style.userSelect = "";
            button.style.cursor = "move";
            button.style.zIndex = "1000"; // Ensure above background
            const resizeHandle = button.querySelector(".resize-handle");
            if (resizeHandle) {
                resizeHandle.style.display = "block";
                resizeHandle.style.pointerEvents = "";
            }
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

            // Ẩn sidebar, header, và toolbar
            if (sidebar) sidebar.style.display = "none";
            if (header) header.style.display = "none";
            if (toolbar) toolbar.style.display = "none";

            // Vô hiệu hóa kéo thả, resize, và click
            disableInteractions();

            // Thiết lập sự kiện click cho confirm buttons
            confirmButtons.forEach(button => {
                button.style.cursor = "pointer";
                button.style.pointerEvents = "auto"; // Cho phép click riêng
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

            // Hiển thị lại sidebar, header, và toolbar
            if (sidebar) sidebar.style.display = "block";
            if (header) header.style.display = "flex";
            if (toolbar) toolbar.style.display = "none";

            // Khôi phục kéo thả, resize, và click
            restoreInteractions();

            // Vô hiệu hóa sự kiện của confirm buttons
            confirmButtons.forEach(button => {
                button.style.cursor = "move";
                // button.style.pointerEvents = "none"; // Vô hiệu hóa click khi không fullscreen
                button.removeEventListener("click", handleButtonClick);
                delete button.dataset.href;
            });

            isFullscreen = false;
            attachPreviewEvent(); // Gắn lại sự kiện cho nút Preview
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