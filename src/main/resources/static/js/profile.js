const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const changeBtn = document.getElementById('changeBtn');

// Khi click nút, mở hộp chọn file
changeBtn.addEventListener('click', () => {
    avatarInput.click();
});

// Khi chọn file
avatarInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            avatarPreview.style.backgroundImage = `url('${e.target.result}')`;
            avatarPreview.style.backgroundSize = 'cover';
            avatarPreview.style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file); // Đọc ảnh thành base64 để preview
    }
});

