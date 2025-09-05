// ====== Biến toàn cục ======
let importData = [];
let currentPage = 1;
let pageSize = 10;
let filter = {
    code: '',
    timeStart: '',
    timeEnd: '',
    status: 'Tất cả'
};

// Thêm biến để theo dõi trạng thái sắp xếp
let currentSort = {
    column: null,
    direction: 'asc'
};

// ====== Hàm định dạng tiền tệ ======
function formatCurrency(amount) {
    return Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// ====== Lấy danh sách phiếu nhập ======
async function fetchImports() {
    try {
        const res = await fetch(`http://localhost:5000/api/imports?page=${currentPage}&limit=${pageSize}`);
        const result = await res.json();
        importData = result.data;
        renderImportTable(importData);
        renderPagination(result.pagination.total, result.pagination.page, result.pagination.limit);
        document.querySelector('.table-container_NH .table-item tbody').scrollTop = 0;
        document.getElementById('total-import-count')?.remove();
        const info = document.createElement('div');
        info.id = 'total-import-count';
        info.style = 'margin: 10px 0 5px 0; font-size: 15px;';
        info.textContent = `Tổng số: ${result.pagination.total} phiếu nhập`;
        document.querySelector('.table-container_NH').prepend(info);
    } catch (err) {
        alert('Lỗi khi lấy danh sách phiếu nhập!');
        console.error(err);
    }
}

// ====== Lọc phiếu nhập ======
function filterImports(data) {
    return data.filter(row => {
        // Lọc theo mã phiếu nhập
        if (filter.code && !row.code.toLowerCase().includes(filter.code.toLowerCase())) return false;
        // Lọc theo trạng thái
        if (filter.status !== 'Tất cả' && row.status !== filter.status) return false;
        // Lọc theo thời gian
        if (filter.timeStart && new Date(row.time) < new Date(filter.timeStart)) return false;
        if (filter.timeEnd && new Date(row.time) > new Date(filter.timeEnd)) return false;
        return true;
    });
}

// --- Render bảng hóa đơn ---
function getStatusClass(status) {
    switch (status) {
        case 'Đã nhập': return 'status-completed';
        case 'Phiếu tạm': return 'status-pending';
        case 'Hủy hàng': return 'status-cancelled';
        default: return 'status-active';
    }
}

// ====== Render bảng phiếu nhập ======
function renderImportTable(data) {
    const filtered = filterImports(data);
    const tbody = document.querySelector('.table-container_NH .table-item tbody');
    tbody.innerHTML = '';
    filtered.forEach(importRow => {
        const canEdit = importRow.status === 'Phiếu tạm';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <button class="action-btn view-btn" data-id="${importRow.code}" title="Xem"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn edit-btn" data-id="${importRow.code}" title="Sửa" ${canEdit ? '' : 'disabled style="opacity:0.5;pointer-events:none;"'}>
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>
            <td>${importRow.code}</td>
            <td>${importRow.time ? new Date(importRow.time).toLocaleDateString('vi-VN') : ''}</td>
            <td>${importRow.supplierName}</td>
            <td>${formatCurrency(importRow.totalAmount)}</td>
            <td><span class="status-badge"${getStatusClass(importRow.status)}></span>${importRow.status}</></td>
        `;
        tbody.appendChild(tr);
    });

    // Gắn sự kiện xem chi tiết
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => openImportDetail(btn.dataset.id);
    });

    // Gắn sự kiện sửa phiếu nhập
    document.querySelectorAll('.edit-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.onclick = () => openEditImportModal(btn.dataset.id);
        }
    });
}

// ====== Phân trang ======
function renderPagination(total, page, limit) {
    const container = document.querySelector('.pagination-container');
    if (!container) return;
    container.innerHTML = '';
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === page ? ' active' : '');
        btn.onclick = () => {
            currentPage = i;
            fetchImports();
        };
        container.appendChild(btn);
    }
}

// ====== Xem chi tiết phiếu nhập ======
async function openImportDetail(code) {
    try {
        // Lấy chi tiết phiếu nhập từ API (hoặc lấy từ importData nếu đã có)
        const importRow = importData.find(i => i.code === code);
        if (!importRow) return alert('Không tìm thấy phiếu nhập!');
        // Lấy chi tiết sản phẩm trong phiếu nhập
        document.getElementById('import-id').textContent = importRow.code;
        document.getElementById('supplier-name').textContent = importRow.supplierName;
        document.getElementById('import-date').textContent = importRow.time ? new Date(importRow.time).toLocaleDateString('vi-VN') : '';
        document.getElementById('import-total-amount').textContent = formatCurrency(importRow.totalAmount);
        document.getElementById('import-status').textContent = importRow.status;

        // Lấy thông tin nhà cung cấp (nếu cần)
        const supplier = await fetchSupplierByName(importRow.supplierName);
        document.getElementById('supplier-phone').textContent = supplier?.phone || '';

        // Lấy chi tiết sản phẩm trong phiếu nhập
        const itemsRes = await fetch(`http://localhost:5000/api/import_details?import_code=${code}`);
        const items = await itemsRes.json();

        // Render danh sách sản phẩm
        const itemsList = document.getElementById('import-items-list');
        itemsList.innerHTML = '';
        let totalItems = 0, totalMoney = 0;
        items.forEach(item => {
            totalItems += item.quantity;
            totalMoney += item.quantity * item.price;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.quantity * item.price)}</td>
            `;
            itemsList.appendChild(tr);
        });
        document.getElementById('import-total-items').textContent = totalItems;
        document.getElementById('import-summary-total').textContent = formatCurrency(totalMoney);

        // Hiện modal
        document.getElementById('import-detail-modal').style.display = 'flex';
    } catch (err) {
        alert('Lỗi khi xem chi tiết phiếu nhập!');
        console.error(err);
    }
}

// ====== Đóng modal chi tiết ======
document.querySelectorAll('#import-detail-modal .close-btn, #import-detail-modal .close-btn-footer').forEach(btn => {
    btn.onclick = function() {
        document.getElementById('import-detail-modal').style.display = 'none';
    };
});

// ====== Lấy thông tin nhà cung cấp theo tên ======
async function fetchSupplierByName(name) {
    try {
        const res = await fetch('http://localhost:5000/api/suppliers');
        const data = await res.json();
        return data.find(sup => sup.name === name);
    } catch {
        return null;
    }
}

// ====== Mở modal nhập hàng mới ======
document.querySelector('.ban-hang_btn').onclick = async function() {
    await openImportModal();
};

async function openImportModal() {
    document.getElementById('import-modal').style.display = 'flex';
    document.getElementById('new-import-id').value = await getNextImportCode();
    document.getElementById('new-supplier-name').innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>';
    document.getElementById('new-import-date').valueAsDate = new Date();
    document.getElementById('new-import-status').value = 'Phiếu tạm';
    document.getElementById('import-products-container').innerHTML = ''; // <-- Xóa sạch sản phẩm cũ
    document.getElementById('import-total-amount').textContent = formatCurrency(0);
    document.getElementById('import-modal').dataset.editing = '';

    // Load danh sách nhà cung cấp
    const res = await fetch('http://localhost:5000/api/suppliers');
    const suppliers = await res.json();
    suppliers.forEach(sup => {
        const opt = document.createElement('option');
        opt.value = sup.name;
        opt.textContent = sup.name;
        document.getElementById('new-supplier-name').appendChild(opt);
    });

    // Load sản phẩm trong kho
    loadInventoryProducts();
}

// ====== Đóng modal nhập hàng ======
document.getElementById('close-import-btn').onclick = function() {
    document.getElementById('import-modal').style.display = 'none';
};

// ====== Lấy mã phiếu nhập mới ======
async function getNextImportCode() {
    try {
        const res = await fetch('http://localhost:5000/api/imports?page=1&limit=1');
        const result = await res.json();
        if (!result.data || result.data.length === 0) return 'PN001';
        const lastCode = result.data[0].code;
        const num = parseInt(lastCode.replace('PN', '')) + 1;
        return 'PN' + num.toString().padStart(3, '0');
    } catch {
        return 'PN001';
    }
}

// ====== Load sản phẩm trong kho để chọn nhập ======
async function loadInventoryProducts() {
    const res = await fetch('http://localhost:5000/api/products');
    const products = await res.json();
    console.log('products:', products); // Thêm dòng này
    const container = document.getElementById('import-inventory-products');
    container.innerHTML = '';
    products.filter(product => product.status === 'Đang bán').forEach(prod => {
        const div = document.createElement('div');
        div.className = 'inventory-product-item';
        div.innerHTML = `
            <span>${prod.name}</span>
            <button class="add-product-btn" data-id="${prod.code}" data-name="${prod.name}" data-price="${prod.buyPrice}">+</button>
        `;
        container.appendChild(div);
    });

    // Gắn sự kiện thêm sản phẩm vào phiếu nhập
    container.querySelectorAll('.add-product-btn').forEach(btn => {
        btn.onclick = function() {
            addProductToImport({
                code: btn.dataset.id,
                name: btn.dataset.name,
                price: btn.dataset.price
            });
        };
    });
}

// ====== Thêm sản phẩm vào phiếu nhập ======
function addProductToImport(product) {
    const container = document.getElementById('import-products-container');
    // Kiểm tra đã có chưa
    let row = container.querySelector(`tr[data-id="${product.code}"]`);
    if (row) {
        // Tăng số lượng
        const qtyInput = row.querySelector('.import-product-qty');
        qtyInput.value = Number(qtyInput.value) + 1;
        updateImportTotal();
        return;
    }
    // Thêm mới
    row = document.createElement('tr');
    row.dataset.id = product.code;
    row.innerHTML = `
        <td>${product.name}</td>
        <td><input type="number" class="import-product-qty" value="1" min="1" style="width:50px;"></td>
        <td><input type="number" class="import-product-price" value="${product.price}" min="0" style="width:90px;"></td>
        <td><button class="remove-import-product-btn"><i class="fa-solid fa-trash"></i></button></td>
    `;
    // Xóa sản phẩm khỏi phiếu nhập
    row.querySelector('.remove-import-product-btn').onclick = function() {
        row.remove();
        updateImportTotal();
    };
    // Khi thay đổi số lượng hoặc giá
    row.querySelector('.import-product-qty').oninput = updateImportTotal;
    row.querySelector('.import-product-price').oninput = updateImportTotal;
    container.appendChild(row);
    updateImportTotal();
}

// ====== Tính tổng tiền phiếu nhập ======
function updateImportTotal() {
    let total = 0;
    const rows = document.querySelectorAll('#import-products-container tr');
    rows.forEach(row => {
        const qty = parseInt(row.querySelector('.import-product-qty')?.value) || 0;
        const price = parseInt(row.querySelector('.import-product-price')?.value) || 0;
        total += qty * price;
    });
    document.getElementById('import-total-amount').textContent = formatCurrency(total);
}

// ====== Lưu phiếu nhập ======
document.getElementById('save-import-btn').onclick = async function() {
    const code = document.getElementById('new-import-id').value;
    const supplierName = document.getElementById('new-supplier-name').value;
    const time = document.getElementById('new-import-date').value;
    const status = document.getElementById('new-import-status').value;
    const rows = document.querySelectorAll('#import-products-container tr');
    const paidAmount = 0; // hoặc lấy từ input nếu có
    if (!supplierName) {
        alert('Vui lòng chọn nhà cung cấp!');
        return;
    }
    if (!time) {
        alert('Vui lòng chọn ngày nhập!');
        return;
    }
    if (rows.length === 0) {
        alert('Vui lòng chọn ít nhất 1 sản phẩm!');
        return;
    }
    const items = [];
    let totalAmount = 0;
    rows.forEach(row => {
        const code = row.dataset.id; // <-- Lấy mã sản phẩm từ data-id
        const name = row.children[0].textContent;
        const quantity = Number(row.querySelector('.import-product-qty').value) || 0;
        const price = Number(row.querySelector('.import-product-price').value) || 0;
        if (quantity > 0 && price >= 0) {
            items.push({ code, name, quantity, price });
            totalAmount += quantity * price;
        }
    });

    // Nếu đang sửa thì gọi PUT, còn lại thì POST
    const isEditing = document.getElementById('import-modal').dataset.editing === 'true';
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://localhost:5000/api/imports/${code}` : 'http://localhost:5000/api/imports';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, supplierName, status, time, items, totalAmount, paidAmount })
        });
        const data = await res.json();
        if (data.success) {
            alert(isEditing ? 'Cập nhật phiếu nhập thành công!' : 'Lưu phiếu nhập thành công!');
            document.getElementById('import-modal').style.display = 'none';
            document.getElementById('import-modal').dataset.editing = '';
            fetchImports();
        } else {
            alert('Lưu phiếu nhập thất bại!');
        }
    } catch (err) {
        alert('Lỗi khi lưu phiếu nhập!');
        console.error(err);
    }
};

// ====== Đóng modal nhập hàng khi bấm nút X ======
document.querySelectorAll('#import-modal .close-btn, #import-modal .close-btn-footer').forEach(btn => {
    btn.onclick = function() {
        document.getElementById('import-modal').style.display = 'none';
    };
});

// ====== Mở modal sửa phiếu nhập ======
async function openEditImportModal(code) {
    // Lấy phiếu nhập cần sửa
    const importRow = importData.find(i => i.code === code);
    if (!importRow) return alert('Không tìm thấy phiếu nhập!');

    document.getElementById('import-modal').style.display = 'flex';
    document.getElementById('new-import-id').value = importRow.code;
    document.getElementById('new-supplier-name').innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>';
    document.getElementById('new-import-date').value = importRow.time ? new Date(importRow.time).toISOString().slice(0,10) : '';
    document.getElementById('new-import-status').value = importRow.status;
    document.getElementById('import-products-container').innerHTML = '';
    document.getElementById('import-total-amount').textContent = formatCurrency(importRow.totalAmount);

    // Load danh sách nhà cung cấp
    const res = await fetch('http://localhost:5000/api/suppliers');
    const suppliers = await res.json();
    suppliers.forEach(sup => {
        const opt = document.createElement('option');
        opt.value = sup.name;
        opt.textContent = sup.name;
        if (sup.name === importRow.supplierName) opt.selected = true;
        document.getElementById('new-supplier-name').appendChild(opt);
    });

    // Load sản phẩm trong kho
    loadInventoryProducts();

    // Load chi tiết sản phẩm đã nhập
    const itemsRes = await fetch(`http://localhost:5000/api/import_details?import_code=${code}`);
    const items = await itemsRes.json();
    items.forEach(item => {
        addProductToImport({
            code: item.product_code,
            name: item.name,
            price: item.price
        });
        // Set lại số lượng và giá
        const row = document.querySelector(`#import-products-container .import-product-row[data-id="${item.product_code}"]`);
        if (row) {
            row.querySelector('.import-product-qty').value = item.quantity;
            row.querySelector('.import-product-price').value = item.price;
        }
    });
    updateImportTotal();

    // Đánh dấu là chế độ sửa (nếu cần)
    document.getElementById('import-modal').dataset.editing = 'true';
}

// ====== Khởi động ======
document.addEventListener('DOMContentLoaded', () => {
    fetchImports();

    document.querySelector('.tim-kiem_NH input').addEventListener('input', function() {
        filter.code = this.value.trim();
        renderImportTable(importData);
    });

    document.getElementById('time-start-user').addEventListener('change', function() {
        filter.timeStart = this.value;
        renderImportTable(importData);
    });
    document.getElementById('time-end-user').addEventListener('change', function() {
        filter.timeEnd = this.value;
        renderImportTable(importData);
    });

    document.querySelectorAll('.trang-thai_NH input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                if (this.id === 'status-all') filter.status = 'Tất cả';
                else if (this.id === 'status-temp') filter.status = 'Phiếu tạm';
                else if (this.id === 'status-completed') filter.status = 'Đã nhập';
                else if (this.id === 'status-cancel') filter.status = 'Hủy hàng';
                renderImportTable(importData);
            }
        });
    });

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

            // Sắp xếp dữ liệu
            const sortedData = sortImports([...importData], column, direction);
            
            // Cập nhật giao diện
            updateSortUI(column, direction);
            renderImportTable(sortedData);
        });
    });
});

// Hàm sắp xếp dữ liệu
function sortImports(data, column, direction) {
    return data.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        // Xử lý các trường hợp đặc biệt
        if (column === 'time') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        } else if (column === 'totalAmount') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
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

// Thêm hàm exportToExcel vào cuối file
function exportToExcel() {
    // Lấy dữ liệu đã lọc
    const filteredImports = filterImports(importData);
    
    // Chuẩn bị dữ liệu cho Excel
    const excelData = filteredImports.map(importRow => {
        return {
            'Mã phiếu nhập': importRow.code,
            'Ngày nhập': formatDate(importRow.time),
            'Nhà cung cấp': importRow.supplierName,
            'Tổng tiền': formatCurrency(importRow.totalAmount),
            'Trạng thái': importRow.status
        };
    });

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    const wscols = [
        {wch: 15}, // Mã phiếu nhập
        {wch: 15}, // Ngày nhập
        {wch: 30}, // Nhà cung cấp
        {wch: 20}, // Tổng tiền
        {wch: 15}  // Trạng thái
    ];
    ws['!cols'] = wscols;

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách phiếu nhập");

    // Tạo tên file với ngày hiện tại
    const today = new Date();
    const fileName = `Danh_sach_phieu_nhap_${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;

    // Xuất file Excel
    XLSX.writeFile(wb, fileName);
}

// Gắn sự kiện cho nút xuất Excel
document.querySelector('.xuat-file_btn').onclick = exportToExcel;