document.addEventListener("DOMContentLoaded", () => {
    // --- Lấy các phần tử DOM chính ---
    const addTextBtn = document.querySelector(".add-btn");
    const addPageBtn = document.getElementById("addPagebtn");

    const elementsList = document.querySelector(".elements");
    const pagesList = document.getElementById("pagesList");

    const canvas = document.querySelector(".canvas");
    const card = document.getElementById("card");

    let pageCounter = 1;
    let selectedText = null;

    // =================================================================
    // --- PHẦN 1: HÀM KÉO THẢ (DRAG & DROP) ---
    // =================================================================
    function makeDraggable(el) {
        let offsetX, offsetY, isDown = false;

        el.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            isDown = true;
            el.style.zIndex = 2000;
            offsetX = e.clientX - el.getBoundingClientRect().left;
            offsetY = e.clientY - el.getBoundingClientRect().top;
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
        });

        document.addEventListener("mouseup", () => {
            isDown = false;
            el.style.zIndex = 1000;
        });
    }

    // =================================================================
    // --- PHẦN 2: SELECTION & DELETE KEY ---
    // =================================================================
    function enableSelection(el) {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            if (selectedText) {
                selectedText.classList.remove("selected-text");
            }
            selectedText = el;
            el.classList.add("selected-text");
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Delete" && selectedText) {
            const id = selectedText.dataset.id;
            selectedText.remove();
            const sideItem = elementsList.querySelector(
                `.element input[data-id="${id}"]`
            );
            if (sideItem) sideItem.parentElement.remove();
            selectedText = null;
        }
    });

    // =================================================================
    // --- PHẦN 3: CÁC HÀM TẠO & XÓA ---
    // =================================================================
    function initTextElement(textEl, id, pageId, keepPosition = false) {
        textEl.classList.add("draggable-text");
        textEl.contentEditable = "false";
        textEl.dataset.id = id;
        textEl.dataset.pageId = pageId;
        textEl.style.position = "absolute";
        textEl.style.cursor = "move";
        textEl.style.zIndex = "1000";

        if (!keepPosition) {
            textEl.style.left = "50px";
            textEl.style.top = "50px";
        }

        canvas.appendChild(textEl);
        makeDraggable(textEl);
        enableSelection(textEl);

        textEl.addEventListener("dblclick", () => {
            textEl.contentEditable = "true";
            textEl.focus();
        });
        textEl.addEventListener("blur", () => {
            textEl.contentEditable = "false";
            const input = elementsList.querySelector(`input[data-id="${id}"]`);
            if (input) input.value = textEl.innerText;
        });
    }

    function addTextElement(text, id, pageId) {
        const textEl = document.createElement("div");
        textEl.innerText = text;
        initTextElement(textEl, id, pageId);
        return textEl;
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
        });
    }

    function createPageElement(name, id) {
        const newCard = document.createElement("div");
        newCard.className = "card";
        newCard.dataset.id = id;
        newCard.style.zIndex = "-1000";
        newCard.innerHTML = `<h3>${name}</h3>`;
        canvas.appendChild(newCard);
    }

    function addPageToSidebar(name, id) {
        const pageListItem = document.createElement("div");
        pageListItem.className = "page";
        pageListItem.dataset.id = id;
        pageListItem.innerHTML = `<div class="name">${name}</div><div class="fas fa-trash-alt"></div>`;
        pagesList.appendChild(pageListItem);

        pageListItem.querySelector(".fa-trash-alt").addEventListener("click", () => {
            pageListItem.remove();
            const cardToRemove = canvas.querySelector(`.card[data-id="${id}"]`);
            if (cardToRemove) cardToRemove.remove();
            const texts = canvas.querySelectorAll(`.draggable-text[data-page-id="${id}"]`);
            texts.forEach((t) => t.remove());
            const sideItems = elementsList.querySelectorAll(`.element[data-page-id="${id}"]`);
            sideItems.forEach((s) => s.remove());
            pageCounter--;
        });
    }

    // =================================================================
    // --- PHẦN 4: KHỞI TẠO ---
    // =================================================================
    function initializeEditor() {
        if (!card) return;
        const initialSidebarTexts = elementsList.querySelectorAll(".element");
        const initialCardTexts = card.querySelectorAll("h3, h1, p");

        initialSidebarTexts.forEach((sidebarItem, index) => {
            const textOnCard = initialCardTexts[index];
            if (textOnCard) {
                const id = `initial-text-${index}`;
                const pageId = "initial-page-0";
                sidebarItem.dataset.id = id;
                sidebarItem.dataset.pageId = pageId;
                textOnCard.dataset.id = id;
                textOnCard.dataset.pageId = pageId;

                const cardWidth = card.clientWidth;
                const cardHeight = card.clientHeight;

                // Căn lề trái khoảng 15% chiều rộng của card
                textOnCard.style.left = `${cardWidth * 0.3}px`;

                // Căn chỉnh theo chiều dọc
                let newTop;
                if (index === 0) { // Dòng "Save the Date"
                    newTop = cardHeight * 0.2;
                } else if (index === 1) { // Dòng "A & B"
                    newTop = cardHeight * 0.4;
                    textOnCard.style.left = `${cardWidth * 0.35}px`;
                } else { // Dòng ngày tháng
                    newTop = cardHeight * 0.65;
                    textOnCard.style.left = `${cardWidth * 0.35}px`;
                }
                textOnCard.style.top = `${newTop}px`;

                // Áp dụng font-size và font-weight để giả lập thẻ H1, H3, P
                if (index === 0) { // h3 - Save the Date
                    textOnCard.style.fontSize = "1.7em";
                    textOnCard.style.fontWeight = "bold";
                } else if (index === 1) { // h1 - A & B
                    textOnCard.style.fontSize = "2.5em";
                    textOnCard.style.fontWeight = "bold";
                } else { // p - Date
                    textOnCard.style.fontSize = "1.2em";
                    textOnCard.style.fontWeight = "normal";
                }

                initTextElement(textOnCard, id, pageId, true);

                sidebarItem.querySelector(".fa-trash-alt").addEventListener("click", () => {
                    sidebarItem.remove();
                    textOnCard.remove();
                });
            }
        });

        const initialPage = pagesList.querySelector(".page");
        if (initialPage && card) {
            const id = "initial-page-0";
            initialPage.dataset.id = id;
            card.dataset.id = id;
            card.style.zIndex = "-1000";

            let trashIcon = initialPage.querySelector(".fa-trash-alt");
            if (!trashIcon) {
                trashIcon = document.createElement("div");
                trashIcon.className = "fas fa-trash-alt";
                initialPage.appendChild(trashIcon);
            }

            trashIcon.addEventListener("click", () => {
                initialPage.remove();
                card.remove();
                const texts = canvas.querySelectorAll(`.draggable-text[data-page-id="${id}"]`);
                texts.forEach((t) => t.remove());
                const sideItems = elementsList.querySelectorAll(`.element[data-page-id="${id}"]`);
                sideItems.forEach((s) => s.remove());
            });
        }
        pageCounter = pagesList.querySelectorAll(".page").length;
    }

    // =================================================================
    // --- PHẦN 5: SỰ KIỆN ---
    // =================================================================
    addTextBtn.addEventListener("click", () => {
        const activePage = pagesList.querySelector(".page");
        if (!activePage) return;

        const pageId = activePage.dataset.id;
        const defaultText = "New Text";
        const id = `text-${Date.now()}`;

        addTextToSidebar(defaultText, id, pageId);
        addTextElement(defaultText, id, pageId);
    });

    addPageBtn.addEventListener("click", () => {
        pageCounter++;
        const defaultName = `Page ${pageCounter}`;
        const id = `page-${Date.now()}`;
        addPageToSidebar(defaultName, id);
        createPageElement(defaultName, id);
    });

    initializeEditor();
});