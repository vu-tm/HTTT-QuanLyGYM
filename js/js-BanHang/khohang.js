// Lấy tất cả sản phẩm từ API
async function getAllProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Lỗi lấy sản phẩm');
        const data = await response.json();
        // Đảm bảo luôn trả về mảng
        return Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        return [];
    }
}

// Hàm lấy sản phẩm theo mã
async function getProductByCode(productCode) {
    const products = await getAllProducts();
    return products.find(product => product.code === productCode);
}

// ====== Biến filter toàn cục ======
let khoFilter = {
    search: '',
    stock: 'all',   // all | available | out
    status: 'all'   // all | Đang bán | Ngừng bán
};

// ====== Hàm lọc sản phẩm theo các tiêu chí ======
async function filterProducts() {
    const products = await getAllProducts();
    return products.filter(product => {
        // Lọc theo tìm kiếm mã hoặc tên
        const searchMatch = khoFilter.search === '' ||
            (product.code && product.code.toLowerCase().includes(khoFilter.search)) ||
            (product.name && product.name.toLowerCase().includes(khoFilter.search));
        // Lọc tồn kho
        let stockMatch = true;
        if (khoFilter.stock === 'available') stockMatch = product.stock > 0;
        else if (khoFilter.stock === 'out') stockMatch = product.stock === 0;
        // Lọc trạng thái
        let statusMatch = true;
        if (khoFilter.status === 'Đang bán') statusMatch = product.status === 'Đang bán';
        else if (khoFilter.status === 'Ngừng bán') statusMatch = product.status === 'Ngừng bán';
        return searchMatch && stockMatch && statusMatch;
    });
}

// ====== Gắn sự kiện cho các filter ======
document.addEventListener('DOMContentLoaded', () => {
    // Tìm kiếm theo mã hàng, tên hàng
    document.getElementById('search-input').addEventListener('input', function() {
        khoFilter.search = this.value.trim().toLowerCase();
        currentPage = 1;
        renderKhoHangTable();
    });

    // Lọc tồn kho
    document.querySelectorAll('input[name="stock-filter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.id === 'stock-all') khoFilter.stock = 'all';
            else if (this.id === 'stock-available') khoFilter.stock = 'available';
            else if (this.id === 'stock-out') khoFilter.stock = 'out';
            currentPage = 1;
            renderKhoHangTable();
        });
    });

    // Lọc trạng thái
    document.querySelectorAll('input[name="status-filter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.id === 'status-all') khoFilter.status = 'all';
            else if (this.id === 'status-selling') khoFilter.status = 'Đang bán';
            else if (this.id === 'status-stopped') khoFilter.status = 'Ngừng bán';
            currentPage = 1;
            renderKhoHangTable();
        });
    });
});

// Hàm sắp xếp sản phẩm (nếu cần)
function sortProducts(products, field, direction = 'asc') {
    return [...products].sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return direction === 'asc' ? valueA - valueB : valueB - valueA;
        }
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

let sortField = 'code'; // Mặc định sort theo mã sản phẩm
let sortAsc = true;     // Mặc định tăng dần
let currentPage = 1;
const pageSize = 10;

// ====== Sửa lại renderKhoHangTable để dùng filterProducts ======
async function renderKhoHangTable() {
    const tableBody = document.querySelector('.table-item tbody');
    if (!tableBody) return;

    const products = await filterProducts();
    let data = [...products];

    // Sort mặc định theo mã sản phẩm (SP001, SP002, ...)
    data.sort((a, b) => {
        if (sortField === 'code') {
            const numA = parseInt((a.code || '').replace(/\D/g, '')) || 0;
            const numB = parseInt((b.code || '').replace(/\D/g, '')) || 0;
            return sortAsc ? numA - numB : numB - numA;
        }
        if (typeof a[sortField] === 'number') {
            return sortAsc ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
        }
        return sortAsc
            ? (a[sortField] + '').localeCompare(b[sortField] + '', 'vi')
            : (b[sortField] + '').localeCompare(a[sortField] + '', 'vi');
    });

    // Phân trang
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize);
    if (currentPage > totalPages) currentPage = 1;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);

    if (pageData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8">Không tìm thấy bản ghi nào</td></tr>`;
        renderPagination(totalPages);
        return;
    }

    let tableRows = '';
    pageData.forEach(product => {
        tableRows += `
            <tr>
                <td>
                    <button class="action-btn view-btn" data-id="${product.code}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" data-id="${product.code}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${product.code}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
                <td>
                    <img src="${product.image}" alt="${product.name}" class="product-thumbnail">
                </td>
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td>${formatCurrency(product.sellPrice)}</td>
                <td>${formatCurrency(product.buyPrice)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${product.status === 'Đang bán' ? 'status-active' : 'status-inactive'}">
                        ${product.status}
                    </span>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = tableRows;

    // Gắn sự kiện cho các nút (nếu cần)
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => viewProduct(btn.getAttribute('data-id'));
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => openEditProductModal(btn.getAttribute('data-id'));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => deleteProduct(btn.getAttribute('data-id'));
    });

    renderPagination(totalPages);
}

// Hàm render phân trang
function renderPagination(totalPages) {
    let container = document.querySelector('.pagination-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'pagination-container';
        document.querySelector('.table-container_TTKH').appendChild(container);
    }
    container.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        btn.onclick = () => {
            currentPage = i;
            renderKhoHangTable();
        };
        container.appendChild(btn);
    }
}

// Sắp xếp khi click tiêu đề cột
document.querySelectorAll('.sortable').forEach(th => {
    th.onclick = function() {
        const field = th.dataset.sort;
        if (sortField === field) {
            sortAsc = !sortAsc;
        } else {
            sortField = field;
            sortAsc = true;
        }
        currentPage = 1;
        renderKhoHangTable();
    };
});

// Khi DOMContentLoaded thì render bảng
document.addEventListener('DOMContentLoaded', () => {
    renderKhoHangTable();
});

function updateSortIcons() {
    document.querySelectorAll('.table-container_TTKH .sortable').forEach(th => {
        const up = th.querySelector('.fa-arrow-up-wide-short');
        const down = th.querySelector('.fa-arrow-down-wide-short');
        if (th.dataset.sort === sortField) {
            up.style.display = sortAsc ? '' : 'none';
            down.style.display = sortAsc ? 'none' : '';
        } else {
            up.style.display = '';
            down.style.display = 'none';
        }
    });
}

// Hàm định dạng tiền tệ (dùng chung)
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hiển thị modal xem chi tiết sản phẩm
function viewProduct(code) {
    getAllProducts().then(products => {
        const product = products.find(p => p.code === code);
        if (!product) {
            alert('Không tìm thấy sản phẩm!');
            return;
        }
        // Điền dữ liệu vào modal chi tiết
        document.getElementById('view-product-id').textContent = product.code;
        document.getElementById('view-product-name').textContent = product.name;
        document.getElementById('view-product-cost').textContent = formatCurrency(product.buyPrice);
        document.getElementById('view-product-price').textContent = formatCurrency(product.sellPrice);
        document.getElementById('view-product-image').src = product.image || '../../img/no-image.png';
        document.getElementById('view-product-modal').style.display = 'flex';
    });
}

// Đóng modal chi tiết sản phẩm
document.querySelectorAll('#view-product-modal .close-btn, #view-product-modal .close-btn-footer').forEach(btn => {
    btn.onclick = function() {
        document.getElementById('view-product-modal').style.display = 'none';
    };
});

// Hiển thị modal sửa sản phẩm
function editProduct(code) {
    getAllProducts().then(products => {
        const product = products.find(p => p.code === code);
        if (!product) {
            alert('Không tìm thấy sản phẩm!');
            return;
        }
        document.getElementById('product-modal-title').textContent = 'Sửa sản phẩm';
        document.getElementById('modal-product-code').value = product.code;
        document.getElementById('modal-product-name').value = product.name;
        document.getElementById('modal-product-sellPrice').value = product.sellPrice;
        document.getElementById('modal-product-buyPrice').value = product.buyPrice;
        document.getElementById('modal-product-stock').value = product.stock;
        document.getElementById('modal-product-status').value = product.status;
        document.getElementById('modal-product-name').readOnly = false;
        document.getElementById('modal-product-sellPrice').readOnly = false;
        document.getElementById('modal-product-buyPrice').readOnly = false;
        document.getElementById('modal-product-stock').readOnly = false;
        document.getElementById('modal-product-status').readOnly = false;
        document.getElementById('save-product-btn').style.display = 'inline-block';
        document.getElementById('save-product-btn').onclick = saveProductChanges;
        document.getElementById('product-modal').style.display = 'flex';
    });
};

// Đóng modal sửa sản phẩm
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Lưu thay đổi sản phẩm (gọi API PUT)
function saveProductChanges() {
    const code = document.getElementById('modal-product-code').value;
    const name = document.getElementById('modal-product-name').value;
    const sellPrice = Number(document.getElementById('modal-product-sellPrice').value);
    const buyPrice = Number(document.getElementById('modal-product-buyPrice').value);
    const stock = Number(document.getElementById('modal-product-stock').value);
    const status = document.getElementById('modal-product-status').value;

    fetch(`http://localhost:5000/api/products/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, buyPrice, sellPrice, status, image })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Cập nhật thành công!');
            closeProductModal();
            renderKhoHangTable();
        } else {
            alert('Cập nhật thất bại!');
        }
    })
    .catch(err => {
        alert('Lỗi khi cập nhật sản phẩm!');
        console.error(err);
    });
}

// Xóa sản phẩm
async function deleteProduct(code) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
        const res = await fetch(`http://localhost:5000/api/products/${code}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (data.success) {
            alert('Đã xóa sản phẩm!');
            renderKhoHangTable();
        } else if (
            data.message &&
            data.message.includes('REFERENCE constraint')
        ) {
            // Nếu không xóa được do liên quan phiếu nhập, cập nhật isDeleted = 1
            const updateRes = await fetch(`http://localhost:5000/api/products/${code}/hide`, {
                method: 'PUT'
            });
            const updateData = await updateRes.json();
            if (updateData.success) {
                alert('Sản phẩm đã được ẩn khỏi hệ thống!');
                renderKhoHangTable();
            } else {
                alert('Không thể ẩn sản phẩm!');
            }
        } else {
            alert('Xóa thất bại!');
        }
    } catch (err) {
        alert('Lỗi khi xóa sản phẩm!');
        console.error(err);
    }
}

// Mở modal thêm sản phẩm
document.querySelector('.ban-hang_btn').onclick = async function() {
    document.getElementById('add-product-modal').style.display = 'flex';
    document.getElementById('add-product-code').value = await getNextProductCode();
    document.getElementById('add-product-stock').value = 0;
    document.querySelector('input[name="product-status"][value="Ngừng bán"]').checked = true;
};

// Đóng modal thêm sản phẩm
document.querySelectorAll('#add-product-modal .close-btn, #add-product-modal .close-btn-footer').forEach(btn => {
    btn.onclick = function() {
        document.getElementById('add-product-modal').style.display = 'none';
        resetAddProductModal();
    };
});

// Reset form khi đóng/thêm xong
function resetAddProductModal() {
    document.querySelector('#add-product-modal .modal-header h3').textContent = 'THÊM MỚI SẢN PHẨM';
    document.getElementById('add-product-code').readOnly = false;
    const saveBtn = document.getElementById('confirm-add-product');
    saveBtn.innerHTML = '<i class="fa-solid fa-plus"></i> THÊM SẢN PHẨM';
    saveBtn.onclick = null;
    saveBtn.onclick = addProductHandler;

    document.getElementById('add-product-name').value = '';
    document.getElementById('add-product-code').value = '';
    document.getElementById('add-product-cost').value = '';
    document.getElementById('add-product-price').value = '';
    document.querySelector('input[name="product-status"][value="Đang bán"]').checked = true;
    document.getElementById('product-image-upload').value = '';
    document.getElementById('image-preview').innerHTML = '<span>Chưa có ảnh</span>';
}

// Xử lý chọn ảnh và hiển thị preview
document.getElementById('product-image-upload').onchange = function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('image-preview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            preview.innerHTML = `<img src="${evt.target.result}" style="max-width:100px;max-height:100px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<span>Chưa có ảnh</span>';
    }
};

// Xử lý thêm sản phẩm
async function addProductHandler() {
    const name = document.getElementById('add-product-name').value.trim();
    const code = document.getElementById('add-product-code').value.trim();
    const buyPrice = Number(document.getElementById('add-product-cost').value);
    const sellPrice = Number(document.getElementById('add-product-price').value);
    const status = document.querySelector('input[name="product-status"]:checked').value;
    const imageInput = document.getElementById('product-image-upload');
    let image = '';

    // Nếu có ảnh, chuyển sang base64 (hoặc upload lên server nếu backend hỗ trợ)
    if (imageInput.files[0]) {
        const file = imageInput.files[0];
        image = await toBase64(file);
    }

    if (!code || !name || !buyPrice || !sellPrice) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, buyPrice, sellPrice, status, image })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Thêm sản phẩm thành công!');
            document.getElementById('add-product-modal').style.display = 'none';
            resetAddProductModal();
            renderKhoHangTable();
        } else {
            alert('Thêm sản phẩm thất bại!');
        }
    })
    .catch(err => {
        alert('Lỗi khi thêm sản phẩm!');
        console.error(err);
    });
};

// Hàm chuyển file ảnh sang base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Hàm lấy mã sản phẩm tiếp theo
async function getNextProductCode() {
    const res = await fetch('http://localhost:5000/api/products');
    const data = await res.json();
    if (!data.length) return 'SP001';

    // Tìm số lớn nhất trong tất cả mã sản phẩm
    let maxNum = 0;
    data.forEach(item => {
        const num = parseInt((item.code || '').replace(/\D/g, '')) || 0;
        if (num > maxNum) maxNum = num;
    });
    const nextNum = maxNum + 1;
    return 'SP' + nextNum.toString().padStart(3, '0');
}

// Cập nhật số lượng sản phẩm trong kho
async function updateProductStock(productCode, stock) {
    try {
        const response = await fetch(`http://localhost:5000/api/products/${productCode}/update-stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock })
        });
        const data = await response.json();
        if (data.success) {
            alert('Cập nhật số lượng thành công!');
            renderKhoHangTable();
        } else {
            alert('Cập nhật số lượng thất bại!');
        }
    } catch (error) {
        alert('Lỗi khi cập nhật số lượng sản phẩm!');
        console.error(error);
    }
}

// Hiển thị modal chỉnh sửa sản phẩm
async function openEditProductModal(productCode) {
    const product = await getProductByCode(productCode);

    document.querySelector('#add-product-modal .modal-header h3').textContent = 'CHỈNH SỬA SẢN PHẨM';
    document.getElementById('add-product-code').value = product.code;
    document.getElementById('add-product-code').readOnly = true;
    document.getElementById('add-product-name').value = product.name;
    document.getElementById('add-product-cost').value = product.buyPrice;
    document.getElementById('add-product-price').value = product.sellPrice;

    document.querySelectorAll('input[name="product-status"]').forEach(radio => {
        radio.checked = (radio.value === product.status);
    });

    const preview = document.getElementById('image-preview');
    if (product.image) {
        preview.innerHTML = `<img src="${product.image}" style="max-width:100%;max-height:180px;">`;
    } else {
        preview.innerHTML = `<span>Chưa có ảnh</span>`;
    }

    // Đổi nút lưu thành "Lưu thay đổi" và reset sự kiện
    const saveBtn = document.getElementById('confirm-add-product');
    saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> LƯU THAY ĐỔI';

    // --- Sửa xung đột: Xóa mọi sự kiện cũ trước khi gán mới ---
    saveBtn.onclick = null;
    saveBtn.onclick = function() {
        saveEditProduct(product.code);
    };

    document.getElementById('add-product-modal').style.display = 'flex';
}

// Lưu chỉnh sửa sản phẩm
async function saveEditProduct(productCode) {
    const name = document.getElementById('add-product-name').value.trim();
    const buyPrice = Number(document.getElementById('add-product-cost').value);
    const sellPrice = Number(document.getElementById('add-product-price').value);
    const status = document.querySelector('input[name="product-status"]:checked').value;
    const imageInput = document.getElementById('product-image-upload');
    let image = '';

    // Nếu có ảnh mới, chuyển sang base64
    if (imageInput.files[0]) {
        const file = imageInput.files[0];
        image = await toBase64(file);
    } else {
        // Nếu không chọn ảnh mới, lấy ảnh cũ (nếu có)
        const previewImg = document.querySelector('#image-preview img');
        image = previewImg ? previewImg.src : '';
    }

    if (!name || !buyPrice || !sellPrice) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    fetch(`http://localhost:5000/api/products/${productCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, buyPrice, sellPrice, status, image })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Cập nhật sản phẩm thành công!');
            document.getElementById('add-product-modal').style.display = 'none';
            resetAddProductModal();
            renderKhoHangTable();
        } else {
            alert('Cập nhật sản phẩm thất bại!');
        }
    })
    .catch(err => {
        alert('Lỗi khi cập nhật sản phẩm!');
        console.error(err);
    });
}

// Thêm hàm exportToExcel vào cuối file
function exportToExcel() {
    // Lấy dữ liệu đã lọc
    const products = filterProducts();
    
    // Chuẩn bị dữ liệu cho Excel
    const excelData = products.map(product => {
        return {
            'Mã sản phẩm': product.code,
            'Tên sản phẩm': product.name,
            'Giá bán': formatCurrency(product.sellPrice),
            'Giá nhập': formatCurrency(product.buyPrice),
            'Tồn kho': product.stock,
            'Trạng thái': product.status
        };
    });

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    const wscols = [
        {wch: 15}, // Mã sản phẩm
        {wch: 30}, // Tên sản phẩm
        {wch: 15}, // Giá bán
        {wch: 15}, // Giá nhập
        {wch: 10}, // Tồn kho
        {wch: 15}  // Trạng thái
    ];
    ws['!cols'] = wscols;

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách sản phẩm");

    // Tạo tên file với ngày hiện tại
    const today = new Date();
    const fileName = `Danh_sach_san_pham_${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;

    // Xuất file Excel
    XLSX.writeFile(wb, fileName);
}

// Gắn sự kiện cho nút xuất Excel
document.querySelector('.xuat-file_btn').onclick = exportToExcel;
