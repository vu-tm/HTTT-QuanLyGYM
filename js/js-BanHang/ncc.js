let supplierData = [];
let currentPage = 1;
let pageSize = 10;

// Thêm biến để theo dõi trạng thái sắp xếp
let currentSort = {
    column: null,
    direction: 'asc'
};

// Hàm sắp xếp dữ liệu
function sortSuppliers(data, column, direction) {
    return data.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        // Xử lý các trường hợp đặc biệt
        if (column === 'code') {
            // Sắp xếp theo mã số (NCC001, NCC002, ...)
            const numA = parseInt(valueA.replace(/\D/g, '')) || 0;
            const numB = parseInt(valueB.replace(/\D/g, '')) || 0;
            return direction === 'asc' ? numA - numB : numB - numA;
        }

        // So sánh giá trị
        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Hàm cập nhật giao diện sắp xếp
function updateSortUI(column, direction) {
    // Reset tất cả các icon
    document.querySelectorAll('.sortable i').forEach(icon => {
        icon.style.display = 'none';
    });

    // Cập nhật icon cho cột được chọn
    const columnHeader = document.querySelector(`[data-sort="${column}"]`);
    if (columnHeader) {
        const upIcon = columnHeader.querySelector('.fa-arrow-up-wide-short');
        const downIcon = columnHeader.querySelector('.fa-arrow-down-wide-short');
        
        if (direction === 'asc') {
            upIcon.style.display = 'inline-block';
            downIcon.style.display = 'none';
        } else {
            upIcon.style.display = 'none';
            downIcon.style.display = 'inline-block';
        }
    }
}

// Khi thay đổi số bản ghi/trang
document.addEventListener('DOMContentLoaded', function() {
    const pageSizeSelect = document.getElementById('ncc-page-size');
    if (pageSizeSelect) {
        pageSizeSelect.value = pageSize;
        pageSizeSelect.onchange = function() {
            pageSize = parseInt(this.value);
            currentPage = 1;
            renderSupplierTable();
            renderPagination();
        };
    }

    // Thêm event listeners cho các cột có thể sắp xếp
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const column = this.dataset.sort;
            
            // Xác định hướng sắp xếp mới
            let direction = 'asc';
            if (currentSort.column === column) {
                direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            }
            
            // Cập nhật trạng thái sắp xếp
            currentSort = {
                column: column,
                direction: direction
            };

            // Cập nhật giao diện và dữ liệu
            updateSortUI(column, direction);
            renderSupplierTable();
        });
    });
});

// Lấy danh sách nhà cung cấp và render bảng
async function fetchSuppliers() {
    try {
        const res = await fetch('http://localhost:5000/api/suppliers');
        let data = await res.json();
        supplierData = data;
        renderSupplierTable();
        renderPagination();
        renderRecordCount();
    } catch (err) {
        alert('Lỗi khi lấy danh sách nhà cung cấp!');
        console.error(err);
    }
}

// Render bảng nhà cung cấp với phân trang
function renderSupplierTable() {
    const tbody = document.querySelector('.table-item tbody');
    tbody.innerHTML = '';
    
    // Sắp xếp dữ liệu nếu có cột được chọn
    let displayData = [...supplierData];
    if (currentSort.column) {
        displayData = sortSuppliers(displayData, currentSort.column, currentSort.direction);
    }
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = displayData.slice(start, end);

    pageData.forEach(sup => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <button class="action-btn edit-btn" data-id="${sup.code}"><i class="fa-solid fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${sup.code}"><i class="fa-solid fa-trash"></i></button>
            </td>
            <td>${sup.code}</td>
            <td>${sup.name}</td>
            <td>${sup.phone || ''}</td>
            <td>${sup.email || ''}</td>
            <td>${sup.address || ''}</td>
        `;
        tbody.appendChild(tr);
    });

    // Gắn sự kiện sửa/xóa
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => openEditSupplier(btn.dataset.id);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => deleteSupplier(btn.dataset.id);
    });
}

// Hiển thị tổng số bản ghi
function renderRecordCount() {
    let info = document.getElementById('supplier-record-info');
    if (!info) {
        info = document.createElement('div');
        info.id = 'supplier-record-info';
        info.style = 'margin: 10px 0; font-size: 15px;';
        document.querySelector('.table-container_NCC').prepend(info);
    }
    info.textContent = `Tổng số: ${supplierData.length} nhà cung cấp`;
}

// Render phân trang
function renderPagination() {
    const container = document.querySelector('.pagination-container');
    if (!container) return;
    container.innerHTML = '';
    const totalPages = Math.ceil(supplierData.length / pageSize);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        btn.onclick = () => {
            currentPage = i;
            renderSupplierTable();
            renderPagination();
        };
        container.appendChild(btn);
    }
}

// Mở modal thêm mới NCC
document.querySelector('.ban-hang_btn').onclick = async function() {
    document.getElementById('supplier-modal-title').textContent = 'Thêm nhà cung cấp mới';
    document.getElementById('supplier-form').reset();
    document.getElementById('supplier-id').value = '';
    document.getElementById('supplier-code').value = await getNextSupplierCode();
    document.getElementById('supplier-code').readOnly = true;
    document.getElementById('supplier-modal').style.display = 'flex';
};

// Đóng modal
document.querySelectorAll('#supplier-modal .close-btn, #supplier-modal .close-btn-footer').forEach(btn => {
    btn.onclick = function() {
        document.getElementById('supplier-modal').style.display = 'none';
    };
});

// Lấy mã NCC mới tự động
async function getNextSupplierCode() {
    try {
        const res = await fetch('http://localhost:5000/api/suppliers');
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return 'NCC001';
        // Sắp xếp lại để lấy mã lớn nhất
        data.sort((a, b) => {
            const numA = parseInt(a.code.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.code.replace(/\D/g, '')) || 0;
            return numA - numB;
        });
        const last = data[data.length - 1].code;
        const num = parseInt(last.replace(/\D/g, '')) + 1;
        return 'NCC' + num.toString().padStart(3, '0');
    } catch {
        return 'NCC001';
    }
}

// Lưu NCC (thêm mới hoặc cập nhật)
document.getElementById('save-supplier-btn').onclick = async function(e) {
    e.preventDefault();
    const code = document.getElementById('supplier-code').value.trim();
    const name = document.getElementById('supplier-name').value.trim();
    const phone = document.getElementById('supplier-phone').value.trim();
    const email = document.getElementById('supplier-email').value.trim();
    const address = document.getElementById('supplier-address').value.trim();
    if (!name) {
        alert('Vui lòng nhập tên nhà cung cấp!');
        return;
    }
    const isEdit = !!document.getElementById('supplier-id').value;
    const url = isEdit
        ? `http://localhost:5000/api/suppliers/${code}`
        : 'http://localhost:5000/api/suppliers';
    const method = isEdit ? 'PUT' : 'POST';
    const body = isEdit
        ? JSON.stringify({ name, phone, email, address })
        : JSON.stringify({ code, name, phone, email, address });

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body
        });
        if (!res.ok) throw new Error(await res.text());
        alert(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        document.getElementById('supplier-modal').style.display = 'none';
        fetchSuppliers();
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
};

// Sửa NCC
async function openEditSupplier(code) {
    try {
        const res = await fetch('http://localhost:5000/api/suppliers');
        const data = await res.json();
        const sup = data.find(s => s.code === code);
        if (!sup) return alert('Không tìm thấy NCC!');
        document.getElementById('supplier-modal-title').textContent = 'Sửa nhà cung cấp';
        document.getElementById('supplier-id').value = sup.code;
        document.getElementById('supplier-code').value = sup.code;
        document.getElementById('supplier-code').readOnly = true;
        document.getElementById('supplier-name').value = sup.name || '';
        document.getElementById('supplier-phone').value = sup.phone || '';
        document.getElementById('supplier-email').value = sup.email || '';
        document.getElementById('supplier-address').value = sup.address || '';
        document.getElementById('supplier-modal').style.display = 'flex';
    } catch (err) {
        alert('Lỗi khi lấy thông tin NCC!');
    }
}

// Xóa NCC
async function deleteSupplier(code) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
    try {
        const res = await fetch(`http://localhost:5000/api/suppliers/${code}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('Đã xóa nhà cung cấp!');
        fetchSuppliers();
    } catch (err) {
        alert('Lỗi khi xóa NCC: ' + err.message);
    }
}

// Tải danh sách NCC khi load trang
window.onload = fetchSuppliers;

// Thêm hàm exportToExcel vào cuối file
function exportToExcel() {
    // Lấy dữ liệu đã lọc
    const suppliers = supplierData;
    
    // Chuẩn bị dữ liệu cho Excel
    const excelData = suppliers.map(supplier => {
        return {
            'Mã NCC': supplier.code,
            'Tên NCC': supplier.name,
            'Số điện thoại': supplier.phone || '',
            'Email': supplier.email || '',
            'Địa chỉ': supplier.address || ''
        };
    });

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    const wscols = [
        {wch: 15}, // Mã NCC
        {wch: 30}, // Tên NCC
        {wch: 15}, // Số điện thoại
        {wch: 25}, // Email
        {wch: 40}  // Địa chỉ
    ];
    ws['!cols'] = wscols;

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhà cung cấp");

    // Tạo tên file với ngày hiện tại
    const today = new Date();
    const fileName = `Danh_sach_nha_cung_cap_${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;

    // Xuất file Excel
    XLSX.writeFile(wb, fileName);
}

// Gắn sự kiện cho nút xuất Excel
document.querySelector('.xuat-file_btn').onclick = exportToExcel;