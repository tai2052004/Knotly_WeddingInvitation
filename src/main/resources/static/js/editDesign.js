document.addEventListener("DOMContentLoaded", () => {
    // --- Lấy các phần tử DOM chính ---
    const addTextBtn = document.getElementById("addTextBtn");
    const addPageBtn = document.getElementById("addPagebtn");
    const confirmBtn = document.querySelector(".confirm-btn");
    const elementsList = document.getElementById("elementsList");
    const pagesList = document.getElementById("pagesList");
    const buttonsList = document.getElementById("buttonList");
    const canvas = document.querySelector(".canvas");

    if (canvas) {
        canvas.style.position = "relative";
        canvas.style.overflow = "visible";
    }

    let card = document.getElementById("card");

    // --- DOM cho quản lý sidebar và ảnh ---
    const textSidebar = document.querySelector(".text-sidebar");
    const imageSidebar = document.querySelector(".image-sidebar");
    const backgroundSidebar = document.querySelector(".background-sidebar");
    const textBtn = document.querySelector(".text-btn");
    const imagesBtn = document.querySelector(".images-btn");
    const backgroundBtn = document.querySelector(".background-btn");
    const uploadImageInput = document.getElementById("uploadImageInput");
    const imageList = document.getElementById("imageList");

    // --- DOM và Logic cho Share Modal ---
    const shareBtn = document.getElementById("shareBtn");
    const shareLinkOverlay = document.getElementById("shareLinkOverlay");
    const closeShareBtn = document.getElementById("closeShareBtn");
    const copyLinkBtn = document.getElementById("copyLinkBtn");
    const shareLinkInput = document.getElementById("shareLinkInput");

    if (shareBtn) {
        shareBtn.addEventListener("click", () => shareLinkOverlay.classList.add("visible"));
    }
    if (closeShareBtn) {
        closeShareBtn.addEventListener("click", () => shareLinkOverlay.classList.remove("visible"));
    }
    if (shareLinkOverlay) {
        shareLinkOverlay.addEventListener("click", (e) => {
            if (e.target === shareLinkOverlay) {
                shareLinkOverlay.classList.remove("visible");
            }
        });
    }
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", () => {
            shareLinkInput.select();
            document.execCommand("copy");
            alert("Link copied to clipboard!");
        });
    }


    let pageCounter = 1;
    let selectedElement = null;
    let activePageId = null;

    // --- Toolbar cho TEXT ---
    let toolbar = document.getElementById("floatingToolbar");
    if (!toolbar) {
        toolbar = document.createElement("div");
        toolbar.id = "floatingToolbar";
        toolbar.className = "floating-toolbar";
        toolbar.style.position = "absolute";
        toolbar.style.display = "none";
        toolbar.style.background = "white";
        toolbar.style.border = "1px solid #ccc";
        toolbar.style.borderRadius = "6px";
        toolbar.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
        toolbar.style.padding = "6px";
        toolbar.style.gap = "6px";
        toolbar.style.zIndex = "3000";
        toolbar.innerHTML = `
            <select id="tb-fontFamily" title="Font">
                <option value="">(font)</option>
                <option value="Muli, Arial, sans-serif">Muli</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="Times New Roman, Times, serif">Times</option>
                <option value="Georgia, serif">Georgia</option>
            </select>
            <input id="tb-fontSize" type="number" min="6" max="200" value="16" style="width:56px" title="Size" />
            <input id="tb-color" type="color" title="Color" />
            <button id="tb-bold" title="Bold"><b>B</b></button>
            <button id="tb-italic" title="Italic"><i>I</i></button>
            <button id="tb-underline" title="Underline"><u>U</u></button>
        `;
        document.body.appendChild(toolbar);
    }

    // --- Toolbar cho CARD ---
    let cardToolbar = document.getElementById("cardToolbar");
    if (!cardToolbar) {
        cardToolbar = document.createElement("div");
        cardToolbar.id = "cardToolbar";
        cardToolbar.className = "floating-toolbar";
        cardToolbar.style.position = "absolute";
        cardToolbar.style.display = "none";
        cardToolbar.style.background = "white";
        cardToolbar.style.border = "1px solid #ccc";
        cardToolbar.style.borderRadius = "6px";
        cardToolbar.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
        cardToolbar.style.padding = "6px";
        cardToolbar.style.gap = "6px";
        cardToolbar.style.zIndex = "3000";
        cardToolbar.innerHTML = `
            <label style="font-size:12px;">W:</label>
            <input id="ctb-width" type="number" min="100" max="2000" value="400" style="width:65px" title="Width" />
            <label style="font-size:12px;">H:</label>
            <input id="ctb-height" type="number" min="100" max="2000" value="600" style="width:65px" title="Height" />
            <label style="font-size:12px;">Color:</label>
            <input id="ctb-color" type="color" title="Background Color" />
        `;
        document.body.appendChild(cardToolbar);
    }

    const tbFont = toolbar.querySelector("#tb-fontFamily");
    const tbSize = toolbar.querySelector("#tb-fontSize");
    const tbColor = toolbar.querySelector("#tb-color");
    const tbBold = toolbar.querySelector("#tb-bold");
    const tbItalic = toolbar.querySelector("#tb-italic");
    const tbUnderline = toolbar.querySelector("#tb-underline");

    const ctbWidth = cardToolbar.querySelector("#ctb-width");
    const ctbHeight = cardToolbar.querySelector("#ctb-height");
    const ctbColor = cardToolbar.querySelector("#ctb-color");


    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return "#ffffff";
        const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!m) return rgb;
        return "#" + [1, 2, 3].map(i => parseInt(m[i]).toString(16).padStart(2, "0")).join("");
    }

    function updateToolbarUI(el) {
        if (!el || (!el.classList.contains("draggable-text") && !el.classList.contains("draggable-button"))) return;
        const cs = window.getComputedStyle(el);
        tbFont.value = cs.fontFamily || "";
        tbSize.value = parseInt(cs.fontSize) || 16;
        tbColor.value = rgbToHex(cs.color);
        tbBold.style.background = (cs.fontWeight === "700" || cs.fontWeight === "bold") ? "#eee" : "transparent";
        tbItalic.style.background = (cs.fontStyle === "italic") ? "#eee" : "transparent";
        tbUnderline.style.background = ((cs.textDecorationLine || cs.textDecoration).indexOf("underline") !== -1) ? "#eee" : "transparent";
    }

    function updateCardToolbarUI(el) {
        if (!el || !el.classList.contains("card")) return;
        const cs = window.getComputedStyle(el);
        ctbWidth.value = parseInt(cs.width);
        ctbHeight.value = parseInt(cs.height);
        ctbColor.value = rgbToHex(cs.backgroundColor);
    }

    function updateToolbarPosition(el) {
        if (!el) return;
        let targetToolbar;
        if (el.classList.contains("draggable-text") || el.classList.contains("draggable-button")) {
            targetToolbar = toolbar;
        } else if (el.classList.contains("card")) {
            targetToolbar = cardToolbar;
        } else {
            return;
        }

        const rect = el.getBoundingClientRect();
        const tbRect = targetToolbar.getBoundingClientRect();
        const top = rect.top + window.scrollY - tbRect.height - 8;
        const left = rect.left + window.scrollX;
        targetToolbar.style.top = `${Math.max(6, top)}px`;
        targetToolbar.style.left = `${Math.max(6, left)}px`;
    }

    // FIX: Sửa lỗi resize-handle biến mất khi click lần 2
    function selectElement(el) {
        // Nếu click lại vào phần tử đang được chọn thì không làm gì cả
        if (selectedElement === el) {
            return;
        }

        // Bỏ chọn phần tử cũ
        if (selectedElement) {
            selectedElement.classList.remove("selected-element-outline");
            selectedElement.classList.remove("selected-image-outline");
            if (selectedElement.classList.contains("card")) {
                selectedElement.style.boxShadow = "";
            }
            const oldHandle = selectedElement.querySelector(".resize-handle");
            if (oldHandle) oldHandle.style.display = "none";
        }

        // Chọn phần tử mới
        selectedElement = el;
        if (selectedElement) {
            if (selectedElement.classList.contains("draggable-text") || selectedElement.classList.contains("draggable-button")) {
                selectedElement.classList.add("selected-element-outline");
                const currentHandle = selectedElement.querySelector(".resize-handle");
                if (currentHandle) currentHandle.style.display = "block";
                cardToolbar.style.display = "none";
                toolbar.style.display = "flex";
                updateToolbarUI(selectedElement);
            } else if (selectedElement.classList.contains("draggable-image") || selectedElement.classList.contains("draggable-qrcode")) {
                selectedElement.classList.add("selected-image-outline");
                const currentHandle = selectedElement.querySelector(".resize-handle");
                if (currentHandle) currentHandle.style.display = "block";
                toolbar.style.display = "none";
                cardToolbar.style.display = "none";
            } else if (selectedElement.classList.contains("card")) {
                selectedElement.style.boxShadow = "0 0 0 2px #4A90E2";
                toolbar.style.display = "none";
                cardToolbar.style.display = "flex";
                updateCardToolbarUI(selectedElement);
            }
            updateToolbarPosition(selectedElement);
        }
    }


    function hideToolbars() {
        if (selectedElement) {
            selectedElement.classList.remove("selected-element-outline");
            selectedElement.classList.remove("selected-image-outline");
            if (selectedElement.classList.contains("card")) {
                selectedElement.style.boxShadow = "";
            }
            const handle = selectedElement.querySelector(".resize-handle");
            if (handle) handle.style.display = "none";
        }
        toolbar.style.display = "none";
        cardToolbar.style.display = "none";
        selectedElement = null;
    }

    tbFont.addEventListener("change", (e) => {
        if (selectedElement && (selectedElement.classList.contains("draggable-text") || selectedElement.classList.contains("draggable-button")))
            selectedElement.style.fontFamily = e.target.value || "";
    });
    tbSize.addEventListener("input", (e) => {
        if (selectedElement && (selectedElement.classList.contains("draggable-text") || selectedElement.classList.contains("draggable-button")))
            selectedElement.style.fontSize = e.target.value + "px";
    });
    tbColor.addEventListener("input", (e) => {
        if (selectedElement && (selectedElement.classList.contains("draggable-text") || selectedElement.classList.contains("draggable-button")))
            selectedElement.style.color = e.target.value;
    });
    tbBold.addEventListener("click", () => {
        if (!selectedElement || (!selectedElement.classList.contains("draggable-text") && !selectedElement.classList.contains("draggable-button"))) return;
        const cur = window.getComputedStyle(selectedElement).fontWeight;
        selectedElement.style.fontWeight = (cur === "700" || cur === "bold") ? "normal" : "bold";
        updateToolbarUI(selectedElement);
    });
    tbItalic.addEventListener("click", () => {
        if (!selectedElement || (!selectedElement.classList.contains("draggable-text") && !selectedElement.classList.contains("draggable-button"))) return;
        const cur = window.getComputedStyle(selectedElement).fontStyle;
        selectedElement.style.fontStyle = (cur === "italic") ? "normal" : "italic";
        updateToolbarUI(selectedElement);
    });
    tbUnderline.addEventListener("click", () => {
        if (!selectedElement || (!selectedElement.classList.contains("draggable-text") && !selectedElement.classList.contains("draggable-button"))) return;
        const cur = window.getComputedStyle(selectedElement).textDecorationLine || "";
        selectedElement.style.textDecoration = (cur.indexOf("underline") !== -1) ? "none" : "underline";
        updateToolbarUI(selectedElement);
    });

    ctbWidth.addEventListener("input", (e) => {
        if (selectedElement && selectedElement.classList.contains("card")) {
            selectedElement.style.width = e.target.value + "px";
        }
    });
    ctbHeight.addEventListener("input", (e) => {
        if (selectedElement && selectedElement.classList.contains("card")) {
            selectedElement.style.height = e.target.value + "px";
        }
    });
    ctbColor.addEventListener("input", (e) => {
        if (selectedElement && selectedElement.classList.contains("card")) {
            selectedElement.style.backgroundColor = e.target.value;
        }
    });

    let resizingEl = null; let resizeStartX = 0; let resizeStartY = 0; let resizeStartW = 0; let resizeStartH = 0;
    document.addEventListener("mousemove", (e) => {
        if (resizingEl) {
            const dx = e.clientX - resizeStartX;
            const dy = e.clientY - resizeStartY;
            const newW = Math.max(20, resizeStartW + dx);
            const newH = Math.max(20, resizeStartH + dy);
            resizingEl.style.width = newW + "px";
            if (resizingEl.classList.contains("draggable-qrcode")) {
                resizingEl.style.height = newW + "px"; // Keep QR code square
            } else {
                resizingEl.style.height = newH + "px";
            }
            updateToolbarPosition(resizingEl);
        }
    });
    document.addEventListener("mouseup", () => {
        if (resizingEl) {
            // Tìm đến đoạn logic dành cho draggable-qrcode
            if (resizingEl.classList.contains("draggable-qrcode")) {
                const url = resizingEl.dataset.url;
                resizingEl.innerHTML = ''; // Dòng này xóa mất resize-handle

                // Vẽ lại QR code
                new QRCode(resizingEl, {
                    text: url,
                    width: resizingEl.offsetWidth - 20,
                    height: resizingEl.offsetHeight - 20,
                });

                // Xóa canvas thừa
                const canvasEl = resizingEl.querySelector('canvas');
                if (canvasEl) canvasEl.remove();

                // === THÊM DÒNG NÀY ĐỂ TẠO LẠI RESIZE HANDLE ĐÃ MẤT ===
                createResizeHandleFor(resizingEl);
                // ======================================================
            }
            resizingEl = null;
            document.body.style.userSelect = "";
        }
    });

    function makeDraggable(el) {
        let offsetX, offsetY, isDown = false;
        el.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            if (e.target.classList.contains("resize-handle")) return;
            if (el.isContentEditable || el.contentEditable === "true") return;
            isDown = true;
            el.style.zIndex = 2000;
            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            e.preventDefault();
        });
        document.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            const canvasRect = canvas.getBoundingClientRect();
            let x = e.clientX - canvasRect.left - offsetX;
            let y = e.clientY - canvasRect.top - offsetY;
            x = Math.max(0, Math.min(x, canvas.clientWidth - el.offsetWidth));
            y = Math.max(0, Math.min(y, canvas.clientHeight - el.offsetHeight));
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            updateToolbarPosition(el);
        });
        document.addEventListener("mouseup", () => {
            isDown = false;
            el.style.zIndex = 1000;
        });
    }

    function enableSelection(el) {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            selectElement(el);
        });
        el.addEventListener("dblclick", (e) => {
            e.stopPropagation();
            if (el.classList.contains("draggable-text") || el.classList.contains("draggable-button")) {
                el.contentEditable = "true";
                el.focus();
                toolbar.style.display = "none";
                cardToolbar.style.display = "none";
            }
            selectElement(el);
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Delete" && selectedElement) {
            const id = selectedElement.dataset.id;
            selectedElement.remove();
            const sideTextItem = elementsList.querySelector(`.element input[data-id="${id}"]`);
            if (sideTextItem) sideTextItem.parentElement.remove();
            const sideImageItem = imageList.querySelector(`.image-item[data-id="${id}"]`);
            if (sideImageItem) sideImageItem.remove();
            const sideButtonItem = buttonsList.querySelector(`.button-item[data-id="${id}"]`);
            if (sideButtonItem) sideButtonItem.remove();
            hideToolbars();
        }
    });

    document.addEventListener("mousedown", (e) => {
        const insideElement = !!e.target.closest(".draggable-text, .draggable-image, .draggable-button, .card, .draggable-qrcode");
        const insideToolbar = !!e.target.closest("#floatingToolbar, #cardToolbar");
        if (!insideElement && !insideToolbar) {
            hideToolbars();
        }
    });

    function createResizeHandleFor(el) {
        if (!el.style.width) el.style.width = Math.max(100, el.offsetWidth) + "px";
        if (!el.style.height) el.style.height = Math.max(50, el.offsetHeight) + "px";
        let resizeHandle = el.querySelector(".resize-handle");
        if (!resizeHandle) {
            resizeHandle = document.createElement("div");
            resizeHandle.className = "resize-handle";
            el.appendChild(resizeHandle);
        }
        resizeHandle.style.cssText = "position: absolute; bottom: 0px; right: 0px; width: 16px; height: 16px; background: linear-gradient(to top left, #fff 50%, #eee 50%); border: 1px solid #666; cursor: nwse-resize; z-index: 2001; display: none; opacity: 0.8; clip-path: polygon(0% 100%, 100% 100%, 100% 0%);";
        resizeHandle.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            resizingEl = el;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            resizeStartW = el.offsetWidth;
            resizeStartH = el.offsetHeight;
            document.body.style.userSelect = "none";
        });
    }

    function initCanvasElement(el, id, pageId, keepPosition = false) {
        el.dataset.id = id;
        el.dataset.pageId = pageId;
        el.style.position = "absolute";
        el.style.cursor = "move";
        el.style.zIndex = "1000";
        canvas.appendChild(el);
        if (!keepPosition) {
            el.style.left = "50px";
            el.style.top = "50px";
        }
        createResizeHandleFor(el);
        makeDraggable(el);
        enableSelection(el);
    }

    function initTextElement(textEl, id, pageId, keepPosition = false) {
        textEl.classList.add("draggable-text");
        textEl.contentEditable = "false";
        initCanvasElement(textEl, id, pageId, keepPosition);
        textEl.addEventListener("blur", () => {
            textEl.contentEditable = "false";
            const input = elementsList.querySelector(`input[data-id="${id}"]`);
            if (input) input.value = textEl.innerText;
            if (selectedElement === textEl) selectElement(textEl);
        });
        textEl.addEventListener("mousedown", (e) => {
            if (textEl.isContentEditable || textEl.contentEditable === "true") {
                e.stopPropagation();
            }
        });
    }

    function initButtonElement(buttonEl, id, pageId, keepPosition = false, linkUrl = '') {
        buttonEl.classList.add("draggable-button");
        buttonEl.contentEditable = "false";
        buttonEl.style.padding = "8px 16px";
        buttonEl.style.border = "1px solid #ccc";
        buttonEl.style.borderRadius = "4px";
        buttonEl.style.backgroundColor = "#ffffff";
        if (linkUrl) {
            buttonEl.dataset.link = linkUrl;
        }
        initCanvasElement(buttonEl, id, pageId, keepPosition);
        buttonEl.addEventListener("blur", () => {
            buttonEl.contentEditable = "false";
            const input = buttonsList.querySelector(`input.name[data-id="${id}"]`);
            if (input) input.value = buttonEl.innerText;
            if (selectedElement === buttonEl) selectElement(buttonEl);
        });
        buttonEl.addEventListener("mousedown", (e) => {
            if (buttonEl.isContentEditable || buttonEl.contentEditable === "true") {
                e.stopPropagation();
            }
        });
    }

    function addTextElement(text, id, pageId) {
        const textEl = document.createElement("div");
        textEl.innerText = text;
        initTextElement(textEl, id, pageId);
        return textEl;
    }

    function addButtonElement(text, id, pageId, linkUrl = '') {
        const buttonEl = document.createElement("button");
        buttonEl.innerText = text;
        initButtonElement(buttonEl, id, pageId, false, linkUrl);
        return buttonEl;
    }

    function addImageElement(imageUrl, id, pageId, fileName = "Uploaded Image") {
        const imgEl = document.createElement("div");
        imgEl.className = "draggable-image";
        imgEl.style.backgroundImage = `url(${imageUrl})`;
        imgEl.style.backgroundSize = "contain";
        imgEl.style.backgroundRepeat = "no-repeat";
        imgEl.style.backgroundPosition = "center";
        imgEl.style.width = "200px";
        imgEl.style.height = "150px";
        initCanvasElement(imgEl, id, pageId);
        addImageToSidebar(fileName, imageUrl, id, pageId);
        return imgEl;
    }

    function addQrCodeElement(url, id, pageId) {
        const qrEl = document.createElement("div");
        qrEl.className = "draggable-qrcode";
        qrEl.dataset.url = url;
        qrEl.style.width = "170px";
        qrEl.style.height = "170px";

        new QRCode(qrEl, {
            text: url,
            width: 150,
            height: 150,
        });
        const canvasEl = qrEl.querySelector('canvas');
        if (canvasEl) {
            canvasEl.remove();
        }
        initCanvasElement(qrEl, id, pageId);
        addQrCodeToSidebar(id, pageId);
        return qrEl;
    }

    function addTextToSidebar(text, id, pageId) {
        const element = document.createElement("div");
        element.className = "element";
        element.innerHTML = `<input class="name" value="${text}" data-id="${id}" /><div class="fas fa-trash-alt"></div>`;
        element.dataset.pageId = pageId;
        elementsList.appendChild(element);
        element.querySelector(".name").addEventListener("input", (e) => {
            const textEl = canvas.querySelector(`.draggable-text[data-id="${id}"]`);
            if (textEl) textEl.innerText = e.target.value;
        });
        element.querySelector(".fa-trash-alt").addEventListener("click", () => {
            element.remove();
            const textEl = canvas.querySelector(`.draggable-text[data-id="${id}"]`);
            if (textEl) textEl.remove();
            if (selectedElement && selectedElement.dataset.id === id) hideToolbars();
        });
    }

    function addButtonToSidebar(text, id, pageId, bgColor = "#ffffff", linkUrl = '') {
        const buttonItem = document.createElement("div");
        buttonItem.className = "element button-item";
        buttonItem.dataset.id = id;
        buttonItem.dataset.pageId = pageId;
        buttonItem.innerHTML = `
            <div style="width:100%; display: flex; flex-direction: column; gap: 4px;">
                <input class="name" value="${text}" data-id="${id}" placeholder="Button Text"/>
                <input class="link-input" value="${linkUrl}" data-id="${id}" placeholder="https://example.com/rsvp-link"/>
            </div>
            <div style="display:flex; flex-direction: column; align-items: center; gap: 8px;">
                <input type="color" class="button-color-picker" value="${bgColor}" data-id="${id}" />
                <div class="fas fa-trash-alt" style="cursor: pointer;"></div>
            </div>
        `;
        buttonsList.appendChild(buttonItem);

        buttonItem.querySelector(".name").addEventListener("input", (e) => {
            const buttonEl = canvas.querySelector(`.draggable-button[data-id="${id}"]`);
            if (buttonEl) buttonEl.innerText = e.target.value;
        });
        buttonItem.querySelector(".link-input").addEventListener("input", (e) => {
            const buttonEl = canvas.querySelector(`.draggable-button[data-id="${id}"]`);
            if (buttonEl) buttonEl.dataset.link = e.target.value;
        });
        buttonItem.querySelector(".button-color-picker").addEventListener("input", (e) => {
            const buttonEl = canvas.querySelector(`.draggable-button[data-id="${id}"]`);
            if (buttonEl) buttonEl.style.backgroundColor = e.target.value;
        });
        buttonItem.querySelector(".fa-trash-alt").addEventListener("click", () => {
            buttonItem.remove();
            const buttonEl = canvas.querySelector(`[data-id="${id}"]`);
            if (buttonEl) buttonEl.remove();
            if (selectedElement && selectedElement.dataset.id === id) hideToolbars();
        });
        buttonItem.addEventListener("click", (e) => {
            if (e.target.tagName !== 'INPUT') {
                const buttonEl = canvas.querySelector(`[data-id="${id}"]`);
                if (buttonEl) selectElement(buttonEl);
            }
        });
    }

    function addQrCodeToSidebar(id, pageId) {
        const qrItem = document.createElement("div");
        qrItem.className = "element button-item";
        qrItem.dataset.id = id;
        qrItem.dataset.pageId = pageId;
        qrItem.innerHTML = `
            <span class="name" data-id="${id}" style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-qrcode"></i> QR Code
            </span>
            <div class="fas fa-trash-alt" style="cursor: pointer;"></div>
        `;
        buttonsList.appendChild(qrItem);
        qrItem.querySelector(".fa-trash-alt").addEventListener("click", () => {
            qrItem.remove();
            const qrEl = canvas.querySelector(`.draggable-qrcode[data-id="${id}"]`);
            if (qrEl) qrEl.remove();
            if (selectedElement && selectedElement.dataset.id === id) hideToolbars();
        });
        qrItem.addEventListener("click", () => {
            const qrEl = canvas.querySelector(`.draggable-qrcode[data-id="${id}"]`);
            if (qrEl) selectElement(qrEl);
        });
    }

    function addImageToSidebar(fileName, imageUrl, id, pageId) {
        const imageItem = document.createElement("div");
        imageItem.className = "element image-item";
        imageItem.dataset.id = id;
        imageItem.dataset.pageId = pageId;
        imageItem.innerHTML = `
            <img src="${imageUrl}" alt="${fileName}" style="width: 50px; height: 50px; object-fit: contain; margin-right: 10px;">
            <span class="name">${fileName}</span>
            <div class="fas fa-trash-alt"></div>
        `;
        imageList.appendChild(imageItem);
        imageItem.querySelector(".fa-trash-alt").addEventListener("click", () => {
            imageItem.remove();
            const imgEl = canvas.querySelector(`[data-id="${id}"]`);
            if (imgEl) imgEl.remove();
            if (selectedElement && selectedElement.dataset.id === id) hideToolbars();
        });
        imageItem.addEventListener("click", () => {
            const imgEl = canvas.querySelector(`[data-id="${id}"]`);
            if (imgEl) selectElement(imgEl);
        });
    }

    function createPageElement(name, id) {
        const newCard = document.createElement("div");
        newCard.className = "card";
        newCard.dataset.id = id;
        newCard.style.position = "relative";
        newCard.style.zIndex = "0";
        canvas.appendChild(newCard);
        newCard.addEventListener("click", (e) => {
            e.stopPropagation();
            selectElement(newCard);
        });
    }

    function attachPageClick(pageListItem, id) {
        pageListItem.addEventListener("click", () => {
            const allPages = pagesList.querySelectorAll(".page");
            allPages.forEach((p) => (p.style.border = "none"));
            pageListItem.style.border = "2px solid white";
            activePageId = id;
            hideToolbars();
            const targetCard = canvas.querySelector(`.card[data-id="${id}"]`);
            if (targetCard) {
                selectElement(targetCard);
            }
        });
    }

    function addPageToSidebar(name, id) {
        const pageListItem = document.createElement("div");
        pageListItem.className = "page";
        pageListItem.dataset.id = id;
        pageListItem.innerHTML = `<div class="name">${name}</div><div class="fas fa-trash-alt"></div>`;
        pagesList.appendChild(pageListItem);
        attachPageClick(pageListItem, id);
        pageListItem.querySelector(".fa-trash-alt").addEventListener("click", (e) => {
            e.stopPropagation();
            pageListItem.remove();
            const cardToRemove = canvas.querySelector(`.card[data-id="${id}"]`);
            if (cardToRemove) cardToRemove.remove();
            const elementsOnPage = canvas.querySelectorAll(`[data-page-id="${id}"]`);
            elementsOnPage.forEach((el) => {
                el.remove();
                const sideTextItem = elementsList.querySelector(`input[data-id="${el.dataset.id}"]`);
                if (sideTextItem) sideTextItem.parentElement.remove();
            });
            if (activePageId === id) activePageId = null;
            hideToolbars();
        });
    }

    function initializeEditor() {
        card = document.getElementById("card");
        if (!card) return;

        card.style.position = "relative";
        card.style.zIndex = "0";

        card.addEventListener("click", (e) => {
            if (e.target === card) {
                e.stopPropagation();
                selectElement(card);
            }
        });

        const initialSidebarTexts = elementsList.querySelectorAll(".element");
        const initialCardTexts = card.querySelectorAll("h3, h1, p");
        initialSidebarTexts.forEach((sidebarItem, index) => {
            const textOnCard = initialCardTexts[index];
            if (textOnCard) {
                const id = `initial-text-${Date.now() + index}`;
                const pageId = "initial-page-0";
                sidebarItem.dataset.id = id;
                sidebarItem.dataset.pageId = pageId;
                const existingNameDiv = sidebarItem.querySelector(".name");
                if (existingNameDiv) {
                    const inputElement = document.createElement("input");
                    inputElement.className = "name";
                    inputElement.value = existingNameDiv.innerText;
                    inputElement.dataset.id = id;
                    sidebarItem.replaceChild(inputElement, existingNameDiv);
                    inputElement.addEventListener("input", (e) => {
                        const textEl = canvas.querySelector(`.draggable-text[data-id="${id}"]`);
                        if (textEl) textEl.innerText = e.target.value;
                    });
                }
                textOnCard.dataset.id = id;
                textOnCard.dataset.pageId = pageId;

                const cardRect = card.getBoundingClientRect();
                textOnCard.style.left = `${cardRect.width * 0.3}px`;
                textOnCard.style.top = `${cardRect.height * (0.2 + index * 0.2)}px`;

                initTextElement(textOnCard, id, pageId, true);
                sidebarItem.querySelector(".fa-trash-alt").addEventListener("click", () => {
                    sidebarItem.remove();
                    textOnCard.remove();
                    if (selectedElement && selectedElement.dataset.id === id) hideToolbars();
                });
            }
        });
        const initialPage = pagesList.querySelector(".page");
        if (initialPage && card) {
            const id = "initial-page-0";
            initialPage.dataset.id = id;
            card.dataset.id = id;
            attachPageClick(initialPage, id);
            activePageId = id;
            initialPage.style.border = "2px solid white";
        }
        pageCounter = pagesList.querySelectorAll(".page").length;
    }

    addTextBtn.addEventListener("click", () => {
        if (!activePageId) { alert("Please select a page first!"); return; }
        const id = `text-${Date.now()}`;
        addTextToSidebar("New Text", id, activePageId);
        const newEl = addTextElement("New Text", id, activePageId);
        selectElement(newEl);
    });

    addPageBtn.addEventListener("click", () => {
        pageCounter++;
        const defaultName = `Page ${pageCounter}`;
        const id = `page-${Date.now()}`;
        addPageToSidebar(defaultName, id);
        createPageElement(defaultName, id);
        const newPageEl = pagesList.querySelector(`.page[data-id="${id}"]`);
        if (newPageEl) {
            const allPages = pagesList.querySelectorAll(".page");
            allPages.forEach((p) => (p.style.border = "none"));
            newPageEl.style.border = "2px solid white";
            activePageId = id;
            const newCard = canvas.querySelector(`.card[data-id="${id}"]`);
            if (newCard) selectElement(newCard);
        }
    });

    function showRsvpOptions() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        const modal = document.createElement('div');
        modal.className = 'rsvp-modal-content';
        modal.innerHTML = `
            <h4>Add RSVP Element</h4>
            <div class="rsvp-options">
                <button id="addQrCodeBtn" class="rsvp-option-btn">
                    <i class="fas fa-qrcode"></i>
                    <span>QR Code</span>
                </button>
                <button id="addRsvpLinkBtn" class="rsvp-option-btn">
                    <i class="fas fa-link"></i>
                    <span>RSVP Link</span>
                </button>
            </div>
            <button class="btn" id="cancelRsvpBtn">Cancel</button>
        `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('visible'), 10);
        const close = () => overlay.remove();

        modal.querySelector('#addQrCodeBtn').addEventListener('click', () => {
            const templateIdInput = document.getElementById("template_id_input");
            if (!templateIdInput || !templateIdInput.value) {
                alert("Please save your design before create RSVP!");
                close();
                return;
            }
            const templateId = templateIdInput.value;
            const id = `qrcode-${Date.now()}`;
            const rsvpUrl = `http://localhost:8080/confirmWeeding?id=${templateId}`;
            const newEl = addQrCodeElement(rsvpUrl, id, activePageId);
            selectElement(newEl);
            close();
        });

        modal.querySelector('#addRsvpLinkBtn').addEventListener('click', () => {
            const templateIdInput = document.getElementById("template_id_input");
            if (!templateIdInput || !templateIdInput.value) {
                alert("Please save your design before create RSVP!");
                close();
                return;
            }
            const templateId = templateIdInput.value;
            const rsvpUrl = `http://localhost:8080/confirmWeeding?id=${templateId}`;
            const id = `button-${Date.now()}`;
            const defaultText = "RSVP Here";
            const defaultBgColor = "#88B04B";
            addButtonToSidebar(defaultText, id, activePageId, defaultBgColor, rsvpUrl);
            const newButtonEl = addButtonElement(defaultText, id, activePageId, rsvpUrl);
            newButtonEl.style.backgroundColor = defaultBgColor;
            newButtonEl.style.color = "white";
            newButtonEl.style.border = "none";
            selectElement(newButtonEl);
            close();
        });
        modal.querySelector('#cancelRsvpBtn').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    }

    confirmBtn.addEventListener("click", () => {
        if (!activePageId) { alert("Please select a page first!"); return; }
        showRsvpOptions();
    });

    textBtn.addEventListener("click", () => {
        textSidebar.style.display = "block";
        imageSidebar.style.display = "none";
        backgroundSidebar.style.display = "none";
        textBtn.classList.add("sideActive");
        imagesBtn.classList.remove("sideActive");
        backgroundBtn.classList.remove("sideActive");
    });

    imagesBtn.addEventListener("click", () => {
        textSidebar.style.display = "none";
        imageSidebar.style.display = "block";
        backgroundSidebar.style.display = "none";
        textBtn.classList.remove("sideActive");
        imagesBtn.classList.add("sideActive");
        backgroundBtn.classList.remove("sideActive");
    });

    backgroundBtn.addEventListener("click", () => {
        textSidebar.style.display = "none";
        imageSidebar.style.display = "none";
        backgroundSidebar.style.display = "block";
        textBtn.classList.remove("sideActive");
        imagesBtn.classList.remove("sideActive");
        backgroundBtn.classList.add("sideActive");
    });

    uploadImageInput.addEventListener("change", (e) => {
        if (!activePageId) { alert("Please select a page to add the image to!"); return; }
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                const id = `image-${Date.now()}`;
                const newEl = addImageElement(imageUrl, id, activePageId, file.name);
                selectElement(newEl);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    });

    const bgColorPicker = document.getElementById("bgColorPicker");
    const colorPresets = document.querySelector(".color-presets");
    const uploadBgInput = document.getElementById("uploadBgInput");
    const uploadedBackgrounds = document.getElementById("uploadedBackgrounds");
    const body = document.body;
    const allPresetColors = document.querySelectorAll(".preset-color");

    function deselectAllPresets() {
        allPresetColors.forEach(preset => preset.classList.remove("selected"));
    }

    if (bgColorPicker) {
        bgColorPicker.addEventListener("input", (e) => {
            body.style.backgroundColor = e.target.value;
            body.style.backgroundImage = 'none';
            deselectAllPresets();
        });
    }

    if (colorPresets) {
        colorPresets.addEventListener("click", (e) => {
            if (e.target.classList.contains("preset-color")) {
                const color = e.target.style.backgroundColor;
                body.style.backgroundColor = color;
                body.style.backgroundImage = 'none';
                if (bgColorPicker) {
                    bgColorPicker.value = rgbToHex(color);
                }
                deselectAllPresets();
                e.target.classList.add("selected");
            }
        });
    }

    if (uploadBgInput) {
        uploadBgInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const url = URL.createObjectURL(file);
            const thumbnailDiv = document.createElement("div");
            thumbnailDiv.className = "uploaded-bg-item";
            thumbnailDiv.dataset.url = url;

            if (file.type.startsWith("image/")) {
                thumbnailDiv.innerHTML = `<img src="${url}" alt="background thumbnail">`;
            } else if (file.type.startsWith("video/")) {
                thumbnailDiv.innerHTML = `<video src="${url}" autoplay muted loop></video>`;
            }

            const deleteBtn = document.createElement("div");
            deleteBtn.className = "uploaded-bg-delete-btn";
            deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            thumbnailDiv.appendChild(deleteBtn);

            if (uploadedBackgrounds) {
                uploadedBackgrounds.appendChild(thumbnailDiv);
            }

            deselectAllPresets();
            body.style.backgroundColor = 'transparent';
            const currentVideo = body.querySelector('video');
            if (currentVideo) {
                body.removeChild(currentVideo);
            }
            if (file.type.startsWith("image/")) {
                body.style.backgroundImage = `url(${url})`;
                body.style.backgroundSize = "cover";
                body.style.backgroundPosition = "center";
                body.style.backgroundRepeat = "no-repeat";
            } else if (file.type.startsWith("video/")) {
                const videoEl = document.createElement('video');
                videoEl.src = url;
                videoEl.autoplay = true;
                videoEl.muted = true;
                videoEl.loop = true;
                videoEl.style.position = 'fixed';
                videoEl.style.top = '0';
                videoEl.style.left = '0';
                videoEl.style.width = '100vw';
                videoEl.style.height = '100vh';
                videoEl.style.objectFit = 'cover';
                videoEl.style.zIndex = '-1';
                body.appendChild(videoEl);
                body.style.backgroundImage = 'none';
            }

            thumbnailDiv.addEventListener("click", (e) => {
                if (e.target.closest('.uploaded-bg-delete-btn')) return;
                const currentVideo = body.querySelector('video');
                if (currentVideo) {
                    body.removeChild(currentVideo);
                }
                if (file.type.startsWith("image/")) {
                    body.style.backgroundImage = `url(${url})`;
                } else if (file.type.startsWith("video/")) {
                    const videoEl = document.createElement('video');
                    videoEl.src = url;
                    videoEl.autoplay = true;
                    videoEl.muted = true;
                    videoEl.loop = true;
                    videoEl.style.position = 'fixed';
                    videoEl.style.top = '0';
                    videoEl.style.left = '0';
                    videoEl.style.width = '100vw';
                    videoEl.style.height = '100vh';
                    videoEl.style.objectFit = 'cover';
                    videoEl.style.zIndex = '-1';
                    body.appendChild(videoEl);
                    body.style.backgroundImage = 'none';
                }
            });

            deleteBtn.addEventListener("click", () => {
                thumbnailDiv.remove();
                if (body.style.backgroundImage.includes(url)) {
                    body.style.backgroundImage = 'none';
                    body.style.backgroundColor = '#fbf6f2';
                }
                const videoToRemove = body.querySelector(`video[src="${url}"]`);
                if (videoToRemove) {
                    videoToRemove.remove();
                }
            });
        });
    }

    const defaultColorPreset = document.querySelector('.preset-color[style*="#fbf6f2"]');
    if (defaultColorPreset) {
        defaultColorPreset.classList.add("selected");
    }
// --- LOGIC LƯU DESIGN ---
    const saveDesignBtn = document.getElementById("saveDesignBtn");
    if (saveDesignBtn) {
        saveDesignBtn.addEventListener("click", async () => {
            const templateIdInput = document.getElementById("template_id_input");
            const canvasElement = document.querySelector(".canvas");

            if (!canvasElement) {
                alert("Lỗi: Không tìm thấy khu vực thiết kế.");
                return;
            }

            const canvasClone = canvasElement.cloneNode(true);

            canvasClone.querySelectorAll(".selected-element-outline, .selected-image-outline, .resize-handle").forEach(el => {
                el.remove();
            });
            const selectedCards = canvasClone.querySelectorAll(".card[style*='box-shadow']");
            selectedCards.forEach(card => card.style.boxShadow = '');

            const htmlCode = canvasClone.innerHTML;
            const templateId = templateIdInput.value;

            // === THAY ĐỔI Ở ĐÂY ===
            let url = '/templates';
            let method = 'POST';

            if (templateId && templateId !== 'null' && templateId.length > 0) {
                url = `/templates/${templateId}`;
                method = 'PUT';
            }
            // =======================

            console.log(`Đang gửi yêu cầu ${method} tới ${url}`);

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ htmlCode: htmlCode }),
                });

                if (response.ok) {
                    const savedTemplate = await response.json();
                    alert('Save design successfully!');

                    if (method === 'POST') {
                        templateIdInput.value = savedTemplate.templateId;
                        console.log(`Đã tạo mới và cập nhật template ID: ${savedTemplate.templateId}`);
                    }
                } else {
                    const errorText = await response.text();
                    alert(`Lỗi khi lưu thiết kế: ${response.status} - ${errorText}`);
                }
            } catch (error) {
                console.error('Lỗi mạng hoặc lỗi khi gửi yêu cầu:', error);
                alert('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
            }
        });
    }
    const generateLinkBtn = document.getElementById("generateLinkBtn");
    const paymentConfirmOverlay = document.getElementById("paymentConfirmOverlay");
    const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
    const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");

    // Lấy lại shareLinkOverlay từ code cũ để có thể ẩn nó đi
    if (generateLinkBtn) {
        // Khi bấm "Generate New Link"
        generateLinkBtn.addEventListener("click", (event) => {
            event.preventDefault(); // Chặn hành vi mặc định của nút

            // Lấy các phần tử cần thiết
            const templateIdInput = document.getElementById("template_id_input");
            const shareLinkInput = document.getElementById("shareLinkInput");

            // 1. Kiểm tra xem thiết kế đã được lưu và có ID hay chưa
            if (!templateIdInput || !templateIdInput.value) {
                alert("Please save design before generate shareable link!");
                return; // Dừng hàm nếu chưa có ID
            }

            // 2. Lấy ID từ input
            const templateId = templateIdInput.value;

            // 3. Tạo đường link chia sẻ
            // (Bạn có thể thay đổi cấu trúc URL này để khớp với đường dẫn xem thiệp mời công khai trên backend)
            // 4. Gán link vừa tạo vào ô input
            shareLinkInput.value = `http://localhost:8080/Invitation?id=${templateId}`;

            // (Tùy chọn) Thông báo cho người dùng biết link đã được tạo
            alert("Đã tạo link chia sẻ thành công! Bạn có thể sao chép nó ngay bây giờ.");
        });
    }

    if (confirmPaymentBtn) {
        // 2. Khi bấm "Accept & Pay"
        confirmPaymentBtn.addEventListener("click", () => {
            console.log("Redirecting to payment page...");
            // Chuyển hướng sang trang thanh toán
            window.location.href = "/payOS";
        });
    }

    // 3. Khi bấm "Cancel" hoặc bấm ra ngoài
    function closePaymentModal() {
        if(paymentConfirmOverlay) paymentConfirmOverlay.classList.remove("visible");
    }

    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener("click", closePaymentModal);
    }

    if (paymentConfirmOverlay) {
        paymentConfirmOverlay.addEventListener("click", (e) => {
            if (e.target === paymentConfirmOverlay) {
                closePaymentModal();
            }
        });
    }
    initializeEditor();
});