document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".add-btn");
    const elementsList = document.querySelector(".elements");
    const card = document.querySelector(".card"); // khung thiệp

    // Tạo text mới trong card
    function createTextElement(text, id) {
        const textEl = document.createElement("div");
        textEl.className = "draggable-text";
        textEl.contentEditable = "false"; // chỉ sửa khi double click
        textEl.innerText = text;
        textEl.dataset.id = id;

        // Vị trí mặc định trong khung
        textEl.style.position = "absolute";
        textEl.style.left = "40px";
        textEl.style.top = "40px";
        textEl.style.cursor = "move";

        // Cho phép kéo
        makeDraggable(textEl);

        // Cho phép double click để chỉnh sửa
        textEl.addEventListener("dblclick", () => {
            textEl.contentEditable = "true";
            textEl.focus();
        });
        textEl.addEventListener("blur", () => {
            textEl.contentEditable = "false";
            // đồng bộ lại với sidebar
            const input = elementsList.querySelector(`input[data-id="${id}"]`);
            if (input) input.value = textEl.innerText;
        });

        card.appendChild(textEl);
    }

    // Drag and drop logic
    function makeDraggable(el) {
        let offsetX, offsetY, isDown = false;

        el.addEventListener("mousedown", e => {
            isDown = true;
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            el.style.zIndex = 1000;
        });

        document.addEventListener("mousemove", e => {
            if (!isDown) return;
            const x = e.clientX - card.offsetLeft - offsetX;
            const y = e.clientY - card.offsetTop - offsetY;
            el.style.left = x + "px";
            el.style.top = y + "px";
        });

        document.addEventListener("mouseup", () => {
            isDown = false;
            el.style.zIndex = "";
        });
    }

    // Khi bấm nút add
    addBtn.addEventListener("click", () => {
        const defaultText = "New Text"; // text mặc định
        const id = Date.now();

        // thêm vào sidebar list
        const element = document.createElement("div");
        element.className = "element";
        element.innerHTML = `
        <input class="name" value="${defaultText}" data-id="${id}" />
        <div class="fas fa-trash-alt"></div>
      `;
        elementsList.appendChild(element);

        // thêm vào card
        createTextElement(defaultText, id);

        // Sửa text trong sidebar -> đổi trong card
        const input = element.querySelector(".name");
        input.addEventListener("input", (e) => {
            const val = e.target.value;
            const textEl = card.querySelector(`.draggable-text[data-id="${id}"]`);
            if (textEl) textEl.innerText = val;
        });

        // Xóa text
        const trash = element.querySelector(".fa-trash-alt");
        trash.addEventListener("click", () => {
            element.remove();
            const textEl = card.querySelector(`.draggable-text[data-id="${id}"]`);
            if (textEl) textEl.remove();
        });
        document.getElementById("addTextBtn").addEventListener("click", () => {
            const textEl = document.createElement("div");
            textEl.className = "draggable-text";
            textEl.textContent = "New Text";

            // đặt text vào giữa card khi thêm mới
            textEl.style.left = (card.clientWidth / 2 - 40) + "px";
            textEl.style.top = (card.clientHeight / 2 - 10) + "px";

            card.appendChild(textEl);
            makeDraggable(textEl);
        });

        // hàm kéo thả
        function makeDraggable(el) {
            let offsetX, offsetY, isDown = false;

            el.addEventListener("mousedown", e => {
                isDown = true;
                const rect = card.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();

                // tính offset dựa trên vị trí hiện tại của element
                offsetX = e.clientX - elRect.left;
                offsetY = e.clientY - elRect.top;

                el.style.zIndex = 1000;
                e.preventDefault();
            });

            const card = document.getElementById("card");
            document.getElementById("addTextBtn").addEventListener("click", () => {
                const textEl = document.createElement("div");
                textEl.className = "draggable-text";
                textEl.textContent = "New Text";
                // đặt text ở giữa card
                textEl.style.left = (card.clientWidth / 2 - 40) + "px";
                textEl.style.top = (card.clientHeight / 2 - 10) + "px";

                textEl.style.position = "absolute";

                card.appendChild(textEl);
                makeDraggable(textEl);
            });

            function makeDraggable(el) {
                let offsetX, offsetY, isDown = false;

                el.addEventListener("mousedown", e => {
                    isDown = true;

                    const rect = card.getBoundingClientRect();

                    // fix lệch chuột: khoảng cách từ chuột đến góc trên-trái của text trong card
                    offsetX = e.clientX - rect.left - el.offsetLeft;
                    offsetY = e.clientY - rect.top - el.offsetTop;

                    e.preventDefault();
                });

                document.addEventListener("mousemove", e => {
                    if (!isDown) return;

                    const rect = card.getBoundingClientRect();

                    let x = e.clientX - rect.left - offsetX;
                    let y = e.clientY - rect.top - offsetY;

                    // giới hạn trong card
                    x = Math.max(0, Math.min(x, card.clientWidth - el.offsetWidth));
                    y = Math.max(0, Math.min(y, card.clientHeight - el.offsetHeight));

                    el.style.left = x + "px";
                    el.style.top = y + "px";
                });

                document.addEventListener("mouseup", () => {
                    isDown = false;
                });
            }
        }
    });
    const addPageBtn = document.getElementById("addPagebtn");
    const pagesList = document.getElementById("pagesList");
    // Sửa: Lấy đúng div.canvas để thêm card mới vào trong đó
    const canvas = document.querySelector(".canvas");
    let pageCounter = 1;

    // Hàm tạo card mới trong canvas
    function createPageElement(name, id) {
        const newCard = document.createElement("div");
        newCard.className = "card";
        newCard.dataset.id = id;
        newCard.innerHTML = `<h3>${name}</h3>`;

        // Thêm card mới vào cuối của div.canvas
        canvas.appendChild(newCard);
    }

    // Khi bấm nút "+ Add Page Element"
    addPageBtn.addEventListener("click", () => {
        pageCounter++;
        const defaultName = `Page ${pageCounter}`;
        const id = Date.now();

        // 1. Thêm vào danh sách sidebar
        const pageListItem = document.createElement("div");
        pageListItem.className = "page";
        pageListItem.innerHTML = `
            <div class="name">${defaultName}</div>
            <div class="fas fa-trash-alt"></div>
        `;
        pagesList.appendChild(pageListItem);

        // 2. Thêm card mới vào canvas
        createPageElement(defaultName, id);

        // 3. Logic xóa
        const trashBtn = pageListItem.querySelector(".fa-trash-alt");
        trashBtn.addEventListener("click", () => {
            // Xóa khỏi sidebar
            pageListItem.remove();

            // Tìm và xóa card tương ứng trong canvas
            const cardToRemove = canvas.querySelector(`.card[data-id="${id}"]`);
            if (cardToRemove) {
                cardToRemove.remove();
            }

            // Sửa: Trừ biến đếm đi 1 sau khi xóa thành công
            pageCounter--;
        });
    });
});
