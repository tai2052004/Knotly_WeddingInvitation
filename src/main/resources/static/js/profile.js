document.addEventListener('DOMContentLoaded', function() {
    // Lấy phần tử input file
    const avatarInput = document.getElementById('avatarInput');

    // Thêm sự kiện khi người dùng chọn tệp
    avatarInput.addEventListener('change', function (event) {
        const file = event.target.files[0]; // Lấy tệp đầu tiên
        if (file) {
            const reader = new FileReader(); // Tạo FileReader để đọc tệp
            reader.onload = function (e) {
                const img = document.getElementById('profileImage'); // Lấy phần tử img
                img.src = e.target.result; // Cập nhật src của ảnh
            };
            reader.readAsDataURL(file); // Đọc tệp dưới dạng URL dữ liệu
        }
    });
});
function previewImage(event) {
    const output = document.getElementById('profileImage');
    output.src = URL.createObjectURL(event.target.files[0]);
}