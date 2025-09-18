const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const uploadText = document.getElementById("upload-text");

// Khi click vào khu vực upload thì mở chọn file
uploadArea.addEventListener("click", () => {
  fileInput.click();
});

// Khi chọn file từ input
fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

// Cho phép kéo & thả file
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = "#4096ff";
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.style.borderColor = "#ccc";
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = "#ccc";
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

// Hàm xử lý hiển thị ảnh
function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn một file hình ảnh!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadArea.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
  };
  reader.readAsDataURL(file);
}
