// Address Map Feature

let mapModal, mapOverlay, mapInput, mapConfirm, mapCancel, miniMap, miniMapMarker, addressTextEl, miniMapWrap;
let currentLatLng, currentAddress;
let selectedElement = null; // Biến theo dõi phần tử đang được chọn
let toolbar = null; // Biến cho toolbar

// --- Bắt đầu: Code được sao chép và chỉnh sửa từ editDesign.js ---

// Hàm chuyển đổi màu RGB sang HEX
function rgbToHex(rgb) {
    if (!rgb) return "#000000";
    const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return rgb;
    return "#" + [1, 2, 3].map(i => parseInt(m[i]).toString(16).padStart(2, "0")).join("");
}

// Tạo và khởi tạo toolbar
function ensureToolbar() {
    if (toolbar) return;

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

    // Gán sự kiện cho các nút trên toolbar
    toolbar.querySelector("#tb-fontFamily").addEventListener("change", (e) => {
        if (selectedElement === addressTextEl) selectedElement.style.fontFamily = e.target.value || "";
    });
    toolbar.querySelector("#tb-fontSize").addEventListener("input", (e) => {
        if (selectedElement === addressTextEl) selectedElement.style.fontSize = e.target.value + "px";
    });
    toolbar.querySelector("#tb-color").addEventListener("input", (e) => {
        if (selectedElement === addressTextEl) selectedElement.style.color = e.target.value;
    });
    toolbar.querySelector("#tb-bold").addEventListener("click", () => {
        if (selectedElement !== addressTextEl) return;
        const cur = window.getComputedStyle(selectedElement).fontWeight;
        selectedElement.style.fontWeight = (cur === "700" || cur === "bold") ? "normal" : "bold";
        updateToolbarUI(selectedElement);
    });
    toolbar.querySelector("#tb-italic").addEventListener("click", () => {
        if (selectedElement !== addressTextEl) return;
        const cur = window.getComputedStyle(selectedElement).fontStyle;
        selectedElement.style.fontStyle = (cur === "italic") ? "normal" : "italic";
        updateToolbarUI(selectedElement);
    });
    toolbar.querySelector("#tb-underline").addEventListener("click", () => {
        if (selectedElement !== addressTextEl) return;
        const cur = window.getComputedStyle(selectedElement).textDecorationLine || "";
        selectedElement.style.textDecoration = (cur.indexOf("underline") !== -1) ? "none" : "underline";
        updateToolbarUI(selectedElement);
    });
}

// Cập nhật giao diện toolbar dựa trên phần tử được chọn
function updateToolbarUI(el) {
    if (!el || el.id !== 'miniMapAddress') return;
    const cs = window.getComputedStyle(el);
    const tbFont = toolbar.querySelector("#tb-fontFamily");
    const tbSize = toolbar.querySelector("#tb-fontSize");
    const tbColor = toolbar.querySelector("#tb-color");
    const tbBold = toolbar.querySelector("#tb-bold");
    const tbItalic = toolbar.querySelector("#tb-italic");
    const tbUnderline = toolbar.querySelector("#tb-underline");

    tbFont.value = cs.fontFamily || "";
    tbSize.value = parseInt(cs.fontSize) || 16;
    tbColor.value = rgbToHex(cs.color);
    tbBold.style.background = (cs.fontWeight === "700" || cs.fontWeight === "bold") ? "#eee" : "transparent";
    tbItalic.style.background = (cs.fontStyle === "italic") ? "#eee" : "transparent";
    tbUnderline.style.background = (cs.textDecorationLine.indexOf("underline") !== -1) ? "#eee" : "transparent";
}

// Cập nhật vị trí toolbar
function updateToolbarPosition(el) {
    if (!el || !toolbar) return;
    const rect = el.getBoundingClientRect();
    const tbRect = toolbar.getBoundingClientRect();
    const top = rect.top + window.scrollY - tbRect.height - 8;
    const left = rect.left + window.scrollX;
    toolbar.style.top = `${Math.max(6, top)}px`;
    toolbar.style.left = `${Math.max(6, left)}px`;
}

// Ẩn toolbar và bỏ chọn phần tử
function hideToolbarAndDeselect() {
    if (selectedElement) {
        selectedElement.classList.remove("selected-element-outline");
        const handle = selectedElement.querySelector(".custom-resize-handle");
        if (handle) handle.style.display = "none";
    }
    if (toolbar) toolbar.style.display = "none";
    selectedElement = null;
}

// Hàm chọn phần tử
function selectElement(el) {
    if (selectedElement) {
        selectedElement.classList.remove("selected-element-outline");
        const oldHandle = selectedElement.querySelector(".custom-resize-handle");
        if (oldHandle) oldHandle.style.display = "none";
    }

    selectedElement = el;

    if (selectedElement) {
        selectedElement.classList.add("selected-element-outline");
        const newHandle = selectedElement.querySelector(".custom-resize-handle");
        if (newHandle) newHandle.style.display = "block";

        if (selectedElement.id === 'miniMapAddress') {
            ensureToolbar();
            toolbar.style.display = "flex";
            updateToolbarUI(selectedElement);
            updateToolbarPosition(selectedElement);
        } else if (selectedElement.id === 'miniMapWrap') {
            // Show resize handle for mini map
            if (toolbar) toolbar.style.display = "none";
        } else {
            if (toolbar) toolbar.style.display = "none";
        }
    }
}

// --- Kết thúc: Code từ editDesign.js ---

// Helper to create triangle resize handle
function createTriangleResizeHandle() {
    const handle = document.createElement("div");
    handle.className = "custom-resize-handle";
    handle.style.position = "absolute";
    handle.style.width = "18px";
    handle.style.height = "18px";
    handle.style.right = "-1px";
    handle.style.bottom = "-1px";
    handle.style.background = "white";
    handle.style.border = "1px solid black";
    handle.style.cursor = "nwse-resize";
    handle.style.zIndex = "201";
    handle.style.display = "none";
    handle.style.clipPath = "polygon(100% 0, 100% 100%, 0 100%)";
    return handle;
}

// Show address input modal
function showAddressModal() {
    mapOverlay = document.createElement("div");
    mapOverlay.style.position = "fixed";
    mapOverlay.style.top = 0;
    mapOverlay.style.left = 0;
    mapOverlay.style.width = "100vw";
    mapOverlay.style.height = "100vh";
    mapOverlay.style.background = "rgba(0,0,0,0.3)";
    mapOverlay.style.backdropFilter = "blur(2px)";
    mapOverlay.style.zIndex = 2000;

    mapModal = document.createElement("div");
    mapModal.style.position = "fixed";
    mapModal.style.top = "50%";
    mapModal.style.left = "50%";
    mapModal.style.transform = "translate(-50%, -50%)";
    mapModal.style.background = "#fff";
    mapModal.style.padding = "24px";
    mapModal.style.borderRadius = "12px";
    mapModal.style.boxShadow = "0 2px 16px rgba(0,0,0,0.2)";
    mapModal.style.zIndex = 2100;
    mapModal.style.display = "flex";
    mapModal.style.flexDirection = "column";
    mapModal.style.alignItems = "center";
    mapModal.innerHTML = `
        <div style="font-size:18px;margin-bottom:12px;">Enter Address</div>
        <input id="addressInput" type="text" style="width:300px;padding:8px;margin-bottom:16px;border-radius:4px;border:1px solid #ccc;" placeholder="Type address..." />
        <div style="display:flex;gap:12px;">
            <button id="addressConfirm" style="padding:8px 16px;">Confirm</button>
            <button id="addressCancel" style="padding:8px 16px;">Cancel</button>
        </div>
    `;

    document.body.appendChild(mapOverlay);
    document.body.appendChild(mapModal);

    mapInput = document.getElementById("addressInput");
    mapConfirm = document.getElementById("addressConfirm");
    mapCancel = document.getElementById("addressCancel");

    if (window.google && window.google.maps) {
        const autocomplete = new google.maps.places.Autocomplete(mapInput, { types: ["geocode"] });
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                mapInput.value = place.formatted_address;
            }
        });
    }

    mapConfirm.onclick = () => {
        const address = mapInput.value.trim();
        if (address) {
            geocodeAddress(address, (latLng, formatted) => {
                if (latLng) {
                    currentLatLng = latLng;
                    currentAddress = formatted;
                    closeAddressModal();
                    showMiniMap(latLng, formatted);
                } else {
                    alert("Address not found!");
                }
            });
        }
    };
    mapCancel.onclick = closeAddressModal;
}

// Remove modal
function closeAddressModal() {
    if (mapModal) mapModal.remove();
    if (mapOverlay) mapOverlay.remove();
}

// Geocode address to lat/lng
function geocodeAddress(address, callback) {
    if (!window.google || !window.google.maps) return callback(null, null);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
            const latLng = results[0].geometry.location;
            callback(latLng, results[0].formatted_address);
        } else {
            callback(null, null);
        }
    });
}

// Add map to sidebar
function addMapToSidebar(address, id) {
    const mapList = document.getElementById("mapList");
    if (!mapList) return;

    const mapItem = document.createElement("div");
    mapItem.className = "element map-item";
    mapItem.dataset.id = id;
    mapItem.innerHTML = `
        <i class="fas fa-map-marker-alt" style="margin-right: 10px; color: #d00;"></i>
        <span class="name">${address}</span>
        <div class="fas fa-trash-alt"></div>
    `;
    mapList.appendChild(mapItem);

    mapItem.querySelector(".fa-trash-alt").addEventListener("click", () => {
        mapItem.remove();
        // Remove mini map and address text from canvas
        if (miniMapWrap) miniMapWrap.remove();
        if (addressTextEl) addressTextEl.remove();
        const zoomBtnWrap = document.getElementById("zoomBtnWrap");
        if (zoomBtnWrap) zoomBtnWrap.remove();
        if (selectedElement && (selectedElement === miniMapWrap || selectedElement === addressTextEl)) {
            hideToolbarAndDeselect();
        }
    });

    mapItem.addEventListener("click", () => {
        if (miniMapWrap) selectElement(miniMapWrap);
    });
}

// Show mini map on canvas
function showMiniMap(latLng, address) {
    if (miniMapWrap) miniMapWrap.remove();
    if (addressTextEl) addressTextEl.remove();
    let oldZoomBtnWrap = document.getElementById("zoomBtnWrap");
    if (oldZoomBtnWrap) oldZoomBtnWrap.remove();

    const canvas = document.querySelector(".canvas");
    if (!canvas) return;

    canvas.style.position = "relative";
    canvas.style.overflow = "visible";

    const mapId = `map-${Date.now()}`;

    miniMapWrap = document.createElement("div");
    miniMapWrap.id = "miniMapWrap";
    miniMapWrap.dataset.id = mapId;
    miniMapWrap.style.width = "180px";
    miniMapWrap.style.height = "180px";
    miniMapWrap.style.borderRadius = "50%";
    miniMapWrap.style.overflow = "hidden";
    miniMapWrap.style.position = "absolute";
    miniMapWrap.style.top = "40px";
    miniMapWrap.style.left = "40px";
    miniMapWrap.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    miniMapWrap.style.zIndex = 100;
    miniMapWrap.style.cursor = "move";

    const mapDiv = document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "100%";
    miniMapWrap.appendChild(mapDiv);

    const mapResizeHandle = createTriangleResizeHandle();
    miniMapWrap.appendChild(mapResizeHandle);

    miniMapWrap.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selectedElement !== miniMapWrap) {
            selectElement(miniMapWrap);
        }
    });

    let resizingMap = false, startXMap, startYMap, startWMap, startHMap;
    mapResizeHandle.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        resizingMap = true;
        startXMap = e.clientX;
        startYMap = e.clientY;
        startWMap = miniMapWrap.offsetWidth;
        startHMap = miniMapWrap.offsetHeight;
        document.body.style.userSelect = "none";
    });
    document.addEventListener("mousemove", (e) => {
        if (!resizingMap) return;
        const dx = e.clientX - startXMap;
        const dy = e.clientY - startYMap;
        miniMapWrap.style.width = Math.max(120, startWMap + dx) + "px";
        miniMapWrap.style.height = Math.max(120, startHMap + dy) + "px";
        updateZoomBtnPosition();
    });
    document.addEventListener("mouseup", () => {
        resizingMap = false;
        document.body.style.userSelect = "";
    });

    addressTextEl = document.createElement("div");
    addressTextEl.id = "miniMapAddress";
    addressTextEl.appendChild(document.createTextNode(address)); // Sử dụng createTextNode
    addressTextEl.style.position = "absolute";
    addressTextEl.style.top = "230px";
    addressTextEl.style.left = "40px";
    addressTextEl.style.background = "#fff";
    addressTextEl.style.padding = "8px 16px";
    addressTextEl.style.borderRadius = "8px";
    addressTextEl.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
    addressTextEl.style.zIndex = 101;
    addressTextEl.style.fontSize = "15px";
    addressTextEl.style.cursor = "move";
    addressTextEl.style.minWidth = "180px";
    // Set initial dimensions
    if (!addressTextEl.style.width) addressTextEl.style.width = "180px";
    if (!addressTextEl.style.height) addressTextEl.style.height = "auto";

    const textResizeHandle = createTriangleResizeHandle();
    addressTextEl.appendChild(textResizeHandle);

    addressTextEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selectedElement !== addressTextEl) {
            selectElement(addressTextEl);
        }
    });

    addressTextEl.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        addressTextEl.contentEditable = "true";
        addressTextEl.focus();
        if (toolbar) toolbar.style.display = "none";
    });

    addressTextEl.addEventListener("blur", () => {
        addressTextEl.contentEditable = "false";
        if(selectedElement === addressTextEl) {
            selectElement(addressTextEl);
        }
    });

    let resizingText = false, startXText, startYText, startWText, startHText;
    textResizeHandle.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        resizingText = true;
        startXText = e.clientX;
        startYText = e.clientY;
        startWText = addressTextEl.offsetWidth;
        startHText = addressTextEl.offsetHeight;
        document.body.style.userSelect = "none";
    });
    document.addEventListener("mousemove", (e) => {
        if (!resizingText) return;
        const dx = e.clientX - startXText;
        const dy = e.clientY - startYText;
        addressTextEl.style.width = Math.max(180, startWText + dx) + "px";
        addressTextEl.style.height = Math.max(32, startHText + dy) + "px";
        if(selectedElement === addressTextEl) updateToolbarPosition(addressTextEl);
    });
    document.addEventListener("mouseup", () => {
        resizingText = false;
        document.body.style.userSelect = "";
    });

    canvas.appendChild(miniMapWrap);
    canvas.appendChild(addressTextEl);

    const zoomBtnWrap = document.createElement("div");
    zoomBtnWrap.id = "zoomBtnWrap";
    zoomBtnWrap.style.position = "absolute";
    zoomBtnWrap.style.zIndex = 200;

    const zoomBtn = document.createElement("button");
    zoomBtn.textContent = "🔍";
    zoomBtn.title = "Zoom map";
    zoomBtn.style.background = "#fff";
    zoomBtn.style.border = "1px solid #ccc";
    zoomBtn.style.borderRadius = "50%";
    zoomBtn.style.width = "32px";
    zoomBtn.style.height = "32px";
    zoomBtn.style.cursor = "pointer";
    zoomBtnWrap.appendChild(zoomBtn);

    canvas.appendChild(zoomBtnWrap);

    function updateZoomBtnPosition() {
        const mapRect = miniMapWrap.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        zoomBtnWrap.style.left = (mapRect.right - canvasRect.left - 40) + "px";
        zoomBtnWrap.style.top = (mapRect.bottom - canvasRect.top - 40) + "px";
    }
    updateZoomBtnPosition();
    new ResizeObserver(updateZoomBtnPosition).observe(miniMapWrap);
    miniMapWrap.addEventListener("mousemove", updateZoomBtnPosition);

    zoomBtn.onclick = function(e) {
        e.stopPropagation();
        showZoomableMap(currentLatLng, currentAddress);
    };

    miniMap = new google.maps.Map(mapDiv, {
        center: latLng,
        zoom: 16,
        disableDefaultUI: true,
        gestureHandling: "none"
    });

    miniMapMarker = new google.maps.Marker({
        position: latLng,
        map: miniMap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#d00",
            fillOpacity: 1,
            strokeWeight: 0
        }
    });

    // Add to sidebar
    addMapToSidebar(address, mapId);

    let dragTarget = null, offsetX = 0, offsetY = 0;
    function dragMouseDown(e) {
        if (e.button !== 0 || (this.contentEditable === 'true')) return;
        const handle = this.querySelector(".custom-resize-handle");
        if(handle && e.target === handle) return;

        dragTarget = this;
        const rect = dragTarget.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.body.style.userSelect = "none";
    }
    function dragMouseMove(e) {
        if (dragTarget) {
            const canvasRect = canvas.getBoundingClientRect();
            dragTarget.style.left = (e.clientX - offsetX - canvasRect.left) + "px";
            dragTarget.style.top = (e.clientY - offsetY - canvasRect.top) + "px";
            if(dragTarget === miniMapWrap) updateZoomBtnPosition();
            if(dragTarget === selectedElement) updateToolbarPosition(dragTarget);
        }
    }
    function dragMouseUp() {
        dragTarget = null;
        document.body.style.userSelect = "";
    }
    miniMapWrap.addEventListener("mousedown", dragMouseDown);
    addressTextEl.addEventListener("mousedown", dragMouseDown);
    document.addEventListener("mousemove", dragMouseMove);
    document.addEventListener("mouseup", dragMouseUp);
}

// Reverse geocode lat/lng to address
function reverseGeocode(latLng, callback) {
    if (!window.google || !window.google.maps) return callback(null);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results[0]) {
            callback(results[0].formatted_address);
        } else {
            callback(null);
        }
    });
}

// Bind Generate address button
window.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generateAddressBtn");
    if (generateBtn) {
        generateBtn.onclick = showAddressModal;
    }

    document.addEventListener("mousedown", (e) => {
        const isInsideElement = e.target.closest("#miniMapWrap, #miniMapAddress");
        const isInsideToolbar = e.target.closest("#floatingToolbar");
        if (!isInsideElement && !isInsideToolbar) {
            hideToolbarAndDeselect();
        }
    });
});

// --- Zoomable map modal ---
function showZoomableMap(latLng, address) {
    const zoomOverlay = document.createElement("div");
    zoomOverlay.style.position = "fixed";
    zoomOverlay.style.top = 0;
    zoomOverlay.style.left = 0;
    zoomOverlay.style.width = "100vw";
    zoomOverlay.style.height = "100vh";
    zoomOverlay.style.background = "rgba(0,0,0,0.3)";
    zoomOverlay.style.backdropFilter = "blur(2px)";
    zoomOverlay.style.zIndex = 4000;

    const zoomModal = document.createElement("div");
    zoomModal.style.position = "fixed";
    zoomModal.style.top = "50%";
    zoomModal.style.left = "50%";
    zoomModal.style.transform = "translate(-50%, -50%)";
    zoomModal.style.width = "80vw";
    zoomModal.style.height = "80vh";
    zoomModal.style.maxWidth = "1000px";
    zoomModal.style.maxHeight = "800px";
    zoomModal.style.background = "#fff";
    zoomModal.style.borderRadius = "16px";
    zoomModal.style.boxShadow = "0 4px 24px rgba(0,0,0,0.25)";
    zoomModal.style.zIndex = 4100;
    zoomModal.style.display = "flex";
    zoomModal.style.flexDirection = "column";

    const header = document.createElement("div");
    header.style.padding = "12px 20px";
    header.style.borderBottom = "1px solid #eee";
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.cursor = "move";
    header.innerHTML = `
        <div id="zoomAddress" style="font-size:16px; font-weight:500;">${address}</div>
        <button id="closeZoomMap" style="background:transparent;border:0;font-size:24px;cursor:pointer;">&times;</button>
    `;

    const mapContainer = document.createElement("div");
    mapContainer.style.flexGrow = 1;

    zoomModal.appendChild(header);
    zoomModal.appendChild(mapContainer);
    document.body.appendChild(zoomOverlay);
    document.body.appendChild(zoomModal);

    const zoomMap = new google.maps.Map(mapContainer, {
        center: latLng,
        zoom: 17,
        mapTypeControl: true,
        streetViewControl: true,
    });

    const marker = new google.maps.Marker({
        position: latLng,
        map: zoomMap,
        draggable: true
    });

    // Add click listener to map for updating location
    zoomMap.addListener("click", (e) => {
        const clickedLatLng = e.latLng;
        marker.setPosition(clickedLatLng);
        zoomMap.setCenter(clickedLatLng);

        reverseGeocode(clickedLatLng, (newAddress) => {
            currentLatLng = clickedLatLng;
            currentAddress = newAddress;
            header.querySelector("#zoomAddress").textContent = newAddress || "Unknown location";

            // ### FIX START ###
            if (addressTextEl && addressTextEl.childNodes[0].nodeType === Node.TEXT_NODE) {
                addressTextEl.childNodes[0].nodeValue = newAddress || "Unknown location";
            }
            // ### FIX END ###

            if (miniMapMarker && miniMap) {
                miniMap.setCenter(clickedLatLng);
                miniMapMarker.setPosition(clickedLatLng);
            }
            // Update sidebar map item
            const mapList = document.getElementById("mapList");
            if (mapList && miniMapWrap) {
                const mapItem = mapList.querySelector(`.map-item[data-id="${miniMapWrap.dataset.id}"]`);
                if (mapItem) {
                    const nameSpan = mapItem.querySelector(".name");
                    if (nameSpan) nameSpan.textContent = newAddress || "Unknown location";
                }
            }
        });
    });

    marker.addListener("dragend", () => {
        const newLatLng = marker.getPosition();
        zoomMap.setCenter(newLatLng);
        reverseGeocode(newLatLng, (newAddress) => {
            currentLatLng = newLatLng;
            currentAddress = newAddress;
            header.querySelector("#zoomAddress").textContent = newAddress || "Unknown location";

            // ### FIX START ###
            if (addressTextEl && addressTextEl.childNodes[0].nodeType === Node.TEXT_NODE) {
                addressTextEl.childNodes[0].nodeValue = newAddress || "Unknown location";
            }
            // ### FIX END ###

            if (miniMapMarker && miniMap) {
                miniMap.setCenter(newLatLng);
                miniMapMarker.setPosition(newLatLng);
            }
            // Update sidebar map item
            const mapList = document.getElementById("mapList");
            if (mapList && miniMapWrap) {
                const mapItem = mapList.querySelector(`.map-item[data-id="${miniMapWrap.dataset.id}"]`);
                if (mapItem) {
                    const nameSpan = mapItem.querySelector(".name");
                    if (nameSpan) nameSpan.textContent = newAddress || "Unknown location";
                }
            }
        });
    });

    header.querySelector("#closeZoomMap").onclick = () => {
        zoomModal.remove();
        zoomOverlay.remove();
    };

    let isDragging = false, startX, startY, startLeft, startTop;
    header.onmousedown = function(e) {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = zoomModal.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        document.body.style.userSelect = "none";
    };
    document.addEventListener("mousemove", function(e) {
        if (isDragging) {
            zoomModal.style.left = (startLeft + e.clientX - startX) + "px";
            zoomModal.style.top = (startTop + e.clientY - startY) + "px";
            zoomModal.style.transform = "none";
        }
    });
    document.addEventListener("mouseup", function() {
        isDragging = false;
        document.body.style.userSelect = "";
    });
}