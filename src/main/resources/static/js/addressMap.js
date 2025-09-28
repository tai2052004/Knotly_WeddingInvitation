// Address Map Feature

let mapModal, mapOverlay, mapInput, mapConfirm, mapCancel, miniMap, miniMapMarker, addressTextEl, miniMapWrap;
let currentLatLng, currentAddress;

// Helper to create triangle resize handle
function createTriangleResizeHandle() {
    const handle = document.createElement("div");
    handle.className = "custom-resize-handle";
    handle.style.position = "absolute";
    handle.style.width = "18px";
    handle.style.height = "18px";
    handle.style.right = "0";
    handle.style.bottom = "0";
    handle.style.background = "linear-gradient(135deg, #fff 50%, transparent 50%)";
    handle.style.borderRight = "1px solid #888";
    handle.style.borderBottom = "1px solid #888";
    handle.style.cursor = "nwse-resize";
    handle.style.zIndex = "201";
    handle.style.opacity = "0.8";
    handle.style.clipPath = "polygon(0% 100%, 100% 100%, 100% 0%)";
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

    // Google Maps Autocomplete
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

// Show mini map on canvas
function showMiniMap(latLng, address) {
    // Remove previous
    if (miniMapWrap) miniMapWrap.remove();
    if (addressTextEl) addressTextEl.remove();
    let oldZoomBtnWrap = document.getElementById("zoomBtnWrap");
    if (oldZoomBtnWrap) oldZoomBtnWrap.remove();

    // Canvas
    const canvas = document.querySelector(".canvas");
    if (!canvas) return;

    // Ensure canvas is relative and overflow visible
    canvas.style.position = "relative";
    canvas.style.overflow = "visible";

    // Map container
    miniMapWrap = document.createElement("div");
    miniMapWrap.id = "miniMapWrap";
    miniMapWrap.style.width = "180px";
    miniMapWrap.style.height = "180px";
    miniMapWrap.style.borderRadius = "50%";
    miniMapWrap.style.overflow = "hidden";
    miniMapWrap.style.position = "absolute";
    miniMapWrap.style.top = "40px";
    miniMapWrap.style.left = "40px";
    miniMapWrap.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    miniMapWrap.style.zIndex = 100;
    miniMapWrap.style.resize = "none";
    miniMapWrap.style.minWidth = "120px";
    miniMapWrap.style.minHeight = "120px";
    miniMapWrap.style.cursor = "move";

    // Map div
    const mapDiv = document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "100%";
    miniMapWrap.appendChild(mapDiv);

    // Custom triangle resize handle for map
    const mapResizeHandle = createTriangleResizeHandle();
    miniMapWrap.appendChild(mapResizeHandle);

    // Resize logic for miniMapWrap
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
        if (resizingMap) {
            resizingMap = false;
            document.body.style.userSelect = "";
        }
    });

    // Address text
    addressTextEl = document.createElement("div");
    addressTextEl.id = "miniMapAddress";
    addressTextEl.textContent = address;
    addressTextEl.style.position = "absolute";
    addressTextEl.style.top = "230px";
    addressTextEl.style.left = "40px";
    addressTextEl.style.background = "#fff";
    addressTextEl.style.padding = "8px 16px";
    addressTextEl.style.borderRadius = "8px";
    addressTextEl.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
    addressTextEl.style.zIndex = 101;
    addressTextEl.style.fontSize = "15px";
    addressTextEl.style.resize = "none";
    addressTextEl.style.overflow = "auto";
    addressTextEl.style.minWidth = "180px";
    addressTextEl.style.minHeight = "32px";
    addressTextEl.style.cursor = "move";

    // Custom triangle resize handle for address text
    const textResizeHandle = createTriangleResizeHandle();
    addressTextEl.appendChild(textResizeHandle);

    // Resize logic for addressTextEl
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
    });
    document.addEventListener("mouseup", () => {
        if (resizingText) {
            resizingText = false;
            document.body.style.userSelect = "";
        }
    });

    canvas.appendChild(miniMapWrap);
    canvas.appendChild(addressTextEl);

    // --- Zoom button outside the map ---
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

    // Init Google Map
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

    // --- Drag logic for miniMapWrap and addressTextEl ---
    let dragTarget = null, offsetX = 0, offsetY = 0;
    function dragMouseDown(e) {
        if (e.button !== 0) return;
        // Prevent drag when resizing (bottom right corner)
        const style = window.getComputedStyle(this);
        const right = parseInt(style.width) - (e.offsetX || 0);
        const bottom = parseInt(style.height) - (e.offsetY || 0);
        if (right < 18 && bottom < 18) return; // near resize handle
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
            updateZoomBtnPosition();
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
});

// --- Zoomable map modal with picking address enabled ---
function showZoomableMap(latLng, address) {
    const zoomOverlay = document.createElement("div");
    zoomOverlay.style.position = "fixed";
    zoomOverlay.style.top = 0;
    zoomOverlay.style.left = 0;
    zoomOverlay.style.width = "100vw";
    zoomOverlay.style.height = "100vh";
    zoomOverlay.style.background = "rgba(0,0,0,0.3)";
    zoomOverlay.style.backdropFilter = "blur(3px)";
    zoomOverlay.style.zIndex = 3000;

    const zoomModal = document.createElement("div");
    zoomModal.style.position = "fixed";
    zoomModal.style.top = "50%";
    zoomModal.style.left = "50%";
    zoomModal.style.transform = "translate(-50%, -50%)";
    zoomModal.style.width = "700px";
    zoomModal.style.height = "500px";
    zoomModal.style.background = "#fff";
    zoomModal.style.borderRadius = "14px";
    zoomModal.style.boxShadow = "0 4px 32px rgba(0,0,0,0.25)";
    zoomModal.style.zIndex = 3100;
    zoomModal.style.display = "flex";
    zoomModal.style.flexDirection = "column";
    zoomModal.style.resize = "both";
    zoomModal.style.overflow = "hidden";
    zoomModal.style.minWidth = "320px";
    zoomModal.style.minHeight = "220px";
    zoomModal.style.cursor = "move";

    const header = document.createElement("div");
    header.style.height = "36px";
    header.style.background = "#f5f5f5";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.padding = "0 16px";
    header.style.cursor = "move";
    header.innerHTML = `<span style="font-weight:600;">Map</span>
        <button id="closeZoomMap" style="border:none;background:none;font-size:20px;cursor:pointer;">&times;</button>`;

    const mapDiv = document.createElement("div");
    mapDiv.style.flex = "1";
    mapDiv.style.width = "100%";
    mapDiv.style.height = "100%";
    mapDiv.style.cursor = "default";

    zoomModal.appendChild(header);
    zoomModal.appendChild(mapDiv);

    document.body.appendChild(zoomOverlay);
    document.body.appendChild(zoomModal);

    // Google Map
    const zoomMap = new google.maps.Map(mapDiv, {
        center: latLng,
        zoom: 17,
        gestureHandling: "auto"
    });
    const marker = new google.maps.Marker({
        position: latLng,
        map: zoomMap
    });

    // Allow picking address only in zoom modal
    zoomMap.addListener("click", function(e) {
        const newLatLng = e.latLng;
        marker.setPosition(newLatLng);
        reverseGeocode(newLatLng, (newAddress) => {
            currentLatLng = newLatLng;
            currentAddress = newAddress;
            if (addressTextEl) addressTextEl.textContent = newAddress || "Unknown address";
            // Update miniMapMarker if exists
            if (miniMapMarker && miniMap) {
                miniMap.setCenter(newLatLng);
                miniMapMarker.setPosition(newLatLng);
            }
        });
    });

    // Close
    header.querySelector("#closeZoomMap").onclick = () => {
        zoomModal.remove();
        zoomOverlay.remove();
    };

    // Drag logic for modal
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
