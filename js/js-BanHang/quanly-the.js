let packageData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;

// Định dạng tiền tệ
function formatCurrency(amount) {
    return Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Lấy danh sách gói tập từ API
async function fetchPackages() {
    try {
        const res = await fetch('http://localhost:5000/api/packages');
        packageData = await res.json();
        filteredData = [...packageData];
        renderPackageTable();
        renderPagination();
    } catch (err) {
        alert('Lỗi khi lấy danh sách gói tập!');
    }
}

// Render bảng gói tập
function renderPackageTable() {
    const tbody = document.querySelector('.table-container_VT .table-item tbody');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    pageData.forEach(pkg => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <button class="action-btn view-btn" data-id="${pkg.code}"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn edit-btn" data-id="${pkg.code}"><i class="fa-solid fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${pkg.code}"><i class="fa-solid fa-trash"></i></button>
            </td>
            <td>${pkg.code}</td>
            <td>${pkg.name}</td>
            <td>${pkg.duration}</td>
            <td>${formatCurrency(pkg.price)}</td>
        `;
        tbody.appendChild(tr);
    });

    // Gắn sự kiện
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => openPackageDetail(btn.dataset.id);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => openEditPackage(btn.dataset.id);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => deletePackage(btn.dataset.id);
    });
}

// Phân trang
function renderPagination() {
    const container = document.querySelector('.pagination-container');
    container.innerHTML = '';
    const totalPages = Math.ceil(filteredData.length / pageSize);
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        btn.onclick = () => {
            currentPage = i;
            renderPackageTable();
            renderPagination();
        };
        container.appendChild(btn);
    }
}

// Xem chi tiết gói tập
function openPackageDetail(code) {
    const pkg = packageData.find(p => p.code === code);
    if (!pkg) return;
    document.getElementById('package-id').textContent = pkg.code;
    document.getElementById('package-code').textContent = pkg.code;
    document.getElementById('package-name').textContent = pkg.name;
    document.getElementById('package-duration').textContent = pkg.duration;
    document.getElementById('package-price').textContent = formatCurrency(pkg.price);
    document.getElementById('package-detail-modal').style.display = 'flex';
}

// Đóng modal chi tiết
document.querySelectorAll('#package-detail-modal .close-btn, #package-detail-modal .close-btn-footer').forEach(btn => {
    btn.onclick = function() {
        document.getElementById('package-detail-modal').style.display = 'none';
    };
});

// Mở modal thêm gói tập
document.querySelector('.them-goitap_btn').onclick = async function() {
    document.getElementById('package-modal').style.display = 'flex';
    document.getElementById('new-package-id').value = await getNextPackageCode();
    document.getElementById('new-package-name').value = '';
    document.getElementById('new-package-duration').value = '';
    document.getElementById('new-package-price').value = '';
    document.getElementById('save-package-btn').onclick = saveNewPackage;
};

// Đóng modal thêm/sửa
document.querySelectorAll('#package-modal .close-btn, #package-modal .close-btn-footer').forEach(btn => {
    btn.onclick = function() {
        document.getElementById('package-modal').style.display = 'none';
    };
});

// Lấy mã gói tập mới tự động
async function getNextPackageCode() {
    try {
        const res = await fetch('http://localhost:5000/api/packages');
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return 'GT001';
        data.sort((a, b) => {
            const numA = parseInt(a.code.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.code.replace(/\D/g, '')) || 0;
            return numA - numB;
        });
        const last = data[data.length - 1].code;
        const num = parseInt(last.replace(/\D/g, '')) + 1;
        return 'GT' + num.toString().padStart(3, '0');
    } catch {
        return 'GT001';
    }
}

// Lưu gói tập mới
async function saveNewPackage() {
    const code = document.getElementById('new-package-id').value.trim();
    const name = document.getElementById('new-package-name').value.trim();
    const duration = Number(document.getElementById('new-package-duration').value);
    const price = Number(document.getElementById('new-package-price').value);

    if (!name || !duration || !price) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    try {
        const res = await fetch('http://localhost:5000/api/packages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, name, duration, price })
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Thêm gói tập thành công!');
        document.getElementById('package-modal').style.display = 'none';
        fetchPackages();
    } catch (err) {
        alert('Lỗi khi thêm gói tập: ' + err.message);
    }
}

// Mở modal sửa gói tập
function openEditPackage(code) {
    const pkg = packageData.find(p => p.code === code);
    if (!pkg) return;
    document.getElementById('package-modal').style.display = 'flex';
    document.getElementById('new-package-id').value = pkg.code;
    document.getElementById('new-package-name').value = pkg.name;
    document.getElementById('new-package-duration').value = pkg.duration;
    document.getElementById('new-package-price').value = pkg.price;
    document.getElementById('save-package-btn').onclick = function() {
        saveEditPackage(pkg.code);
    };
}

// Lưu sửa gói tập
async function saveEditPackage(code) {
    const name = document.getElementById('new-package-name').value.trim();
    const duration = Number(document.getElementById('new-package-duration').value);
    const price = Number(document.getElementById('new-package-price').value);

    if (!name || !duration || !price) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    try {
        const res = await fetch(`http://localhost:5000/api/packages/${code}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, duration, price })
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Cập nhật gói tập thành công!');
        document.getElementById('package-modal').style.display = 'none';
        fetchPackages();
    } catch (err) {
        alert('Lỗi khi cập nhật gói tập: ' + err.message);
    }
}

// Xóa gói tập
async function deletePackage(code) {
    if (!confirm('Bạn có chắc chắn muốn xóa gói tập này?')) return;
    try {
        const res = await fetch(`http://localhost:5000/api/packages/${code}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('Đã xóa gói tập!');
        fetchPackages();
    } catch (err) {
        alert('Lỗi khi xóa gói tập: ' + err.message);
    }
}

// Tìm kiếm và lọc
function applyFilters() {
    const codeFilter = document.querySelector('.tim-kiem_VT input[placeholder="Theo mã gói tập"]').value.trim().toLowerCase();
    const nameFilter = document.querySelector('.tim-kiem_VT input[placeholder="Theo tên gói tập"]').value.trim().toLowerCase();
    const durationMin = Number(document.getElementById('duration-min').value) || 0;
    const durationMax = Number(document.getElementById('duration-max').value) || Infinity;
    const priceMin = Number(document.getElementById('price-min').value) || 0;
    const priceMax = Number(document.getElementById('price-max').value) || Infinity;

    filteredData = packageData.filter(pkg => {
        const matchCode = pkg.code.toLowerCase().includes(codeFilter);
        const matchName = pkg.name.toLowerCase().includes(nameFilter);
        const matchDuration = pkg.duration >= durationMin && pkg.duration <= durationMax;
        const matchPrice = pkg.price >= priceMin && pkg.price <= priceMax;
        return matchCode && matchName && matchDuration && matchPrice;
    });
    currentPage = 1;
    renderPackageTable();
    renderPagination();
}

// Gắn sự kiện tìm kiếm/lọc
document.querySelectorAll('.tim-kiem_VT input, .thoi-gian_VT input').forEach(input => {
    input.oninput = applyFilters;
});

// Khởi động
document.addEventListener('DOMContentLoaded', () => {
    fetchPackages();
});

// Thêm hàm exportToExcel vào cuối file
function exportToExcel() {
    // Lấy dữ liệu đã lọc
    const packages = filteredData;
    
    // Chuẩn bị dữ liệu cho Excel
    const excelData = packages.map(pkg => {
        return {
            'Mã gói tập': pkg.code,
            'Tên gói tập': pkg.name,
            'Thời hạn (ngày)': pkg.duration,
            'Giá': formatCurrency(pkg.price)
        };
    });

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    const wscols = [
        {wch: 15}, // Mã gói tập
        {wch: 30}, // Tên gói tập
        {wch: 15}, // Thời hạn
        {wch: 20}  // Giá
    ];
    ws['!cols'] = wscols;

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách gói tập");

    // Tạo tên file với ngày hiện tại
    const today = new Date();
    const fileName = `Danh_sach_goi_tap_${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;

    // Xuất file Excel
    XLSX.writeFile(wb, fileName);
}

// Gắn sự kiện cho nút xuất Excel
document.querySelector('.xuat-file_btn').onclick = exportToExcel;