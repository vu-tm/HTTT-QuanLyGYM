// --- Biến toàn cục ---
let allInvoices = [];
let allProducts = [];
let allCustomers = [];
let allEmployees = [];
let allPackages = []; // Thêm biến này
let currentPage = 1;
let recordsPerPage = 10;
let isEditMode = false;

// --- Hàm khởi tạo ---
document.addEventListener('DOMContentLoaded', async function () {
    await loadAllData();
    renderInvoiceTable();
    initEventHandlers();
    initFilterEvents();
});

// --- Load dữ liệu ---
async function loadAllData() {
    allInvoices = await fetchData('/api/invoices');
    allProducts = await fetchData('/api/products');
    console.log('allProducts:', allProducts); // Thêm dòng này
    // Lấy khách hàng
    allCustomers = await fetchData('/api/customers');
    // Lấy nhân viên
    allEmployees = await fetchData('/api/employees/all');
    // Lấy gói hàng
    allPackages = await fetchData('/api/packages'); // Thêm dòng này
}

// --- Lấy tất cả sản phẩm ĐANG BÁN ---
async function getActiveProducts() {
    const allProducts = await fetchData('/api/products');
    // Lọc những sản phẩm có status là 'Đang bán'
    return allProducts.filter(p => p.status === 'Đang bán');
}

// --- Hàm fetch dữ liệu ---
async function fetchData(api) {
    try {
        const res = await fetch(`http://localhost:5000${api}`);
        const data = await res.json();
        // Nếu data là object và có thuộc tính data là mảng
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return [];
    } catch (e) {
        console.error('Lỗi fetch:', api, e);
        return [];
    }
}

// --- Lọc và tìm kiếm hóa đơn ---
function getFilteredInvoices() {
    let filtered = [...allInvoices];

    // Lọc theo mã hóa đơn
    const codeVal = document.querySelector('.tim-kiem_BH input[placeholder="Theo mã Hóa đơn"]').value.trim().toLowerCase();
    if (codeVal) {
        filtered = filtered.filter(inv => (inv.code || '').toLowerCase().includes(codeVal));
    }

    // Lọc theo mã hàng, tên hàng
    const prodVal = document.querySelector('.tim-kiem_BH input[placeholder="Theo mã hàng, tên hàng"]').value.trim().toLowerCase();
    if (prodVal) {
        filtered = filtered.filter(inv =>
            (inv.items || []).some(item =>
                (item.product_code && item.product_code.toLowerCase().includes(prodVal)) ||
                (item.name && item.name.toLowerCase().includes(prodVal))
            )
        );
    }

    // Lọc theo tên khách
    const cusVal = document.querySelector('.tim-kiem_BH input[placeholder="Theo tên khách"]').value.trim().toLowerCase();
    if (cusVal) {
        filtered = filtered.filter(inv => (inv.customerName || '').toLowerCase().includes(cusVal));
    }

    // Lọc theo thời gian
    const timeStart = document.getElementById('time-start-user').value;
    const timeEnd = document.getElementById('time-end-user').value;
    if (timeStart) {
        filtered = filtered.filter(inv => inv.time && inv.time >= timeStart);
    }
    if (timeEnd) {
        filtered = filtered.filter(inv => inv.time && inv.time <= timeEnd + 'T23:59:59');
    }

    // Lọc theo trạng thái
    const statusVal = document.getElementById('status-filter').value;
    if (statusVal && statusVal !== 'Tất cả') {
        filtered = filtered.filter(inv => inv.status === statusVal);
    }

    // Lọc theo loại hóa đơn
    const billVal = document.getElementById('bill-filter').value;
    if (billVal && billVal !== 'Tất cả') {
        filtered = filtered.filter(inv => inv.type === billVal);
    }

    // Lọc theo phương thức thanh toán
    const payVal = document.getElementById('payment-filter').value;
    if (payVal && payVal !== 'Tất cả') {
        filtered = filtered.filter(inv => inv.paymentMethod === payVal);
    }

    return filtered;
}

// --- Render bảng hóa đơn ---
function getStatusClass(status) {
    switch (status) {
        case 'Hoàn thành': return 'status-completed';
        case 'Phiếu tạm': return 'status-pending';
        case 'Đã hủy': return 'status-cancelled';
        default: return 'status-active';
    }
}

function renderInvoiceTable() {
    const tbody = document.querySelector('.table-item tbody');
    tbody.innerHTML = '';
    let filteredInvoices = getFilteredInvoices();

    // Sắp xếp theo số thứ tự trong mã hóa đơn (giảm dần)
    filteredInvoices.sort((a, b) => {
        const numA = parseInt((a.code || '').replace(/\D/g, '')) || 0;
        const numB = parseInt((b.code || '').replace(/\D/g, '')) || 0;
        return numB - numA; // Giảm dần, nếu muốn tăng dần thì đổi lại numA - numB
    });

    const pagedInvoices = paginate(filteredInvoices, currentPage, recordsPerPage);

    pagedInvoices.forEach(inv => {
        const isDisabled = inv.status === 'Hoàn thành' || inv.status === 'Đã hủy';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <button class="action-btn view-btn" data-id="${inv.code}"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn edit-btn" data-id="${inv.code}" ${isDisabled ? 'disabled style="opacity:0.5;pointer-events:none;"' : ''}><i class="fa-solid fa-pen"></i></button>
            </td>
            <td>${inv.code}</td>
            <td>${formatDate(inv.time)}</td>
            <td>${inv.customerName || ''}</td>
            <td>${getEmployeeName(inv.employee_code)}</td>
            <td>${formatCurrency(inv.totalAmount)}</td>
            <td>
                <span class="status-badge ${getStatusClass(inv.status)}">${inv.status}</span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Cập nhật tổng số hóa đơn, hoàn thành, phiếu tạm, doanh thu
    document.getElementById('total-invoices').textContent = filteredInvoices.length;
    document.getElementById('completed-invoices').textContent = filteredInvoices.filter(i => i.status === 'Hoàn thành').length;
    document.getElementById('pending-invoices').textContent = filteredInvoices.filter(i => i.status === 'Phiếu tạm').length;
    document.getElementById('total-revenue').textContent = formatCurrency(
        filteredInvoices.filter(i => i.status === 'Hoàn thành').reduce((sum, i) => sum + (i.totalAmount || 0), 0)
    );

    renderPagination(filteredInvoices.length);
}

// --- Phân trang ---
function paginate(arr, page, perPage) {
    const start = (page - 1) * perPage;
    return arr.slice(start, start + perPage);
}

function renderPagination(totalRecords = allInvoices.length) {
    const container = document.querySelector('.pagination-container');
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            renderInvoiceTable();
        };
        container.appendChild(btn);
    }
}

// --- Định dạng ---
function formatCurrency(val) {
    return val ? Number(val).toLocaleString('vi-VN') + ' ₫' : '0 ₫';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
}

function getEmployeeName(code) {
    const emp = allEmployees.find(e => e.code === code);
    return emp ? emp.name : '';
}

// --- Xử lý sự kiện ---
function initEventHandlers() {
    // Số bản ghi/trang
    document.getElementById('records-per-page').onchange = function () {
        recordsPerPage = Number(this.value);
        currentPage = 1;
        renderInvoiceTable();
    };

    // Xem chi tiết hóa đơn hoặc chỉnh sửa hóa đơn
    document.querySelector('.table-item tbody').onclick = function (e) {
        if (e.target.closest('.view-btn')) {
            const id = e.target.closest('.view-btn').dataset.id;
            openInvoiceDetailModal(id);
        }
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            openEditInvoiceModal(id);
        }
    };

    // Nút bán hàng (tạo hóa đơn mới)
    document.querySelector('.ban-hang_btn').onclick = openSellModal;

    // Đóng modal chi tiết hóa đơn
    document.querySelectorAll('.close-btn, .close-btn-footer').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('invoice-detail-modal').style.display = 'none';
            document.getElementById('sell-modal').style.display = 'none';
        };
    });

    // Nút xuất file Excel
    document.querySelector('.xuat-file_btn').onclick = exportToExcel;

    // Khi đổi loại hóa đơn thì render lại danh sách sản phẩm/gói tập
    document.getElementById('new-invoice-type_BH').onchange = function () {
        document.getElementById('products-container').innerHTML = '';
        renderInventoryProducts();
    };
}

// --- Gắn sự kiện cho các input/filter ---
function initFilterEvents() {
    // Input tìm kiếm
    document.querySelectorAll('.tim-kiem_BH input').forEach(input => {
        input.oninput = () => {
            currentPage = 1;
            renderInvoiceTable();
        };
    });
    // Bộ lọc select
    ['status-filter', 'bill-filter', 'payment-filter'].forEach(id => {
        document.getElementById(id).onchange = () => {
            currentPage = 1;
            renderInvoiceTable();
        };
    });
    // Lọc theo ngày
    document.getElementById('time-start-user').onchange = () => {
        currentPage = 1;
        renderInvoiceTable();
    };
    document.getElementById('time-end-user').onchange = () => {
        currentPage = 1;
        renderInvoiceTable();
    };
}

// --- Modal chi tiết hóa đơn ---
async function openInvoiceDetailModal(code) {
    const modal = document.getElementById('invoice-detail-modal');
    const invoice = allInvoices.find(i => i.code === code);
    if (!invoice) return;

    document.getElementById('invoice-id').textContent = invoice.code;
    document.getElementById('customer-name_BH').textContent = invoice.customerName || '';
    document.getElementById('employ_BH').textContent = getEmployeeName(invoice.employee_code);
    document.getElementById('date_BH').textContent = formatDate(invoice.time);
    document.getElementById('invoice-type_BH').textContent = invoice.type || '';
    document.getElementById('payment-method_BH').textContent = invoice.paymentMethod || '';
    document.getElementById('status_BH').textContent = invoice.status || '';

    // Danh sách sản phẩm
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    let totalItems = 0, totalAmount = 0;
    (invoice.items || []).forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name || ''}</td>
            <td>${item.quantity || 0}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
        `;
        itemsList.appendChild(tr);
        totalItems += item.quantity || 0;
        totalAmount += (item.price || 0) * (item.quantity || 0);
    });
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount);
    document.getElementById('summary-total').textContent = formatCurrency(totalAmount);

    modal.style.display = 'flex';
}

// --- Modal bán hàng ---
function openSellModal() {
    isEditMode = false;
    const sellModal = document.getElementById('sell-modal');
    const sellModalTitle = sellModal.querySelector('.modal-header h3');
    sellModalTitle.textContent = 'TẠO HÓA ĐƠN MỚI';

    // Hiện dòng khách hàng
    const customerRow = sellModal.querySelector('label[for="new-customer-name_BH"]').parentElement;
    customerRow.style.display = '';

    document.getElementById('new-invoice-id').value = getNextInvoiceCode();
    fillCustomerSelect();
    fillEmployeeSelect();
    document.getElementById('new-customer-name_BH').disabled = false;
    document.getElementById('new-employee_BH').value = '';
    document.getElementById('new-invoice-type_BH').value = 'Bán hàng'; // hoặc giá trị mặc định bạn muốn
    document.getElementById('new-payment-method_BH').value = 'Tiền mặt';
    document.getElementById('new-status_BH').value = 'Phiếu tạm';
    document.getElementById('products-container').innerHTML = '';
    document.getElementById('invoice-total-amount').textContent = '0 ₫';
    renderInventoryProducts();

    document.getElementById('save-invoice-btn').onclick = saveInvoice;
    sellModal.style.display = 'flex';
}

// --- Sinh mã hóa đơn mới ---
function getNextInvoiceCode() {
    if (!allInvoices.length) return 'HD001';
    let maxNum = 0;
    allInvoices.forEach(inv => {
        const num = parseInt((inv.code || '').replace(/\D/g, '')) || 0;
        if (num > maxNum) maxNum = num;
    });
    return 'HD' + (maxNum + 1).toString().padStart(3, '0');
}

// --- Đổ danh sách khách hàng ---
function fillCustomerSelect() {
    const select = document.getElementById('new-customer-name_BH');
    select.innerHTML = `<option value="">-- Chọn khách hàng --</option>`;
    allCustomers.forEach(cus => {
        select.innerHTML += `<option value="${cus.code}">${cus.name}</option>`;
    });
}

// --- Đổ danh sách nhân viên ---
function fillEmployeeSelect() {
    const select = document.getElementById('new-employee_BH');
    select.innerHTML = '';
    allEmployees.forEach(emp => {
        select.innerHTML += `<option value="${emp.code}">${emp.name}</option>`;
    });
}

// --- Hiển thị sản phẩm trong kho (chỉ sản phẩm đang bán) ---
function renderInventoryProducts() {
    const container = document.getElementById('inventory-products');
    container.innerHTML = '';

    const invoiceType = document.getElementById('new-invoice-type_BH').value;

    if (invoiceType === 'Bán hàng') {
        // Chỉ hiện sản phẩm
        const productsForSale = allProducts.filter(p => p.status === 'Đang bán');
        productsForSale.forEach(prod => {
            const div = document.createElement('div');
            div.className = 'inventory-product-item';
            div.innerHTML = `
                <span>${prod.name}</span>
                <span>${formatCurrency(prod.sellPrice)}</span>
                <span>Còn: ${prod.stock}</span>
                <button class="add-to-invoice-btn" data-type="product" data-code="${prod.code}">+</button>
            `;
            container.appendChild(div);
        });
    } else if (invoiceType === 'Bán vé') {
        // Chỉ hiện gói tập
        allPackages.forEach(pkg => {
            const div = document.createElement('div');
            div.className = 'inventory-product-item';
            div.innerHTML = `
                <span>${pkg.name} (Gói tập)</span>
                <span>${formatCurrency(pkg.price)}</span>
                <span>Thời hạn: ${pkg.duration} ngày</span>
                <button class="add-to-invoice-btn" data-type="package" data-code="${pkg.code}">+</button>
            `;
            container.appendChild(div);
        });
    }

    // Sự kiện thêm vào hóa đơn
    container.querySelectorAll('.add-to-invoice-btn').forEach(btn => {
        btn.onclick = function () {
            const type = btn.dataset.type;
            const code = btn.dataset.code;
            addItemToInvoiceByCode(type, code);
        };
    });
}

// --- Thêm sản phẩm vào hóa đơn ---
function addItemToInvoiceByCode(type, code) {
    const container = document.getElementById('products-container');
    let row = container.querySelector(`[data-type="${type}"][data-code="${code}"]`);
    if (row) {
        // Tăng số lượng
        const qtyInput = row.querySelector('.product-qty');
        qtyInput.value = Number(qtyInput.value) + 1;
        qtyInput.dispatchEvent(new Event('input'));
        return;
    }
    let name = '', price = 0;
    if (type === 'product') {
        const prod = allProducts.find(p => p.code === code);
        if (!prod) return;
        name = prod.name;
        price = prod.sellPrice;
    } else if (type === 'package') {
        const pkg = allPackages.find(p => p.code === code);
        if (!pkg) return;
        name = pkg.name + ' (Gói tập)';
        price = pkg.price;
    }
    row = document.createElement('div');
    row.className = 'product-row';
    row.dataset.type = type;
    row.dataset.code = code;
    row.innerHTML = `
        <span>${name}</span>
        <input type="number" class="product-qty" min="1" value="1" style="width:60px;">
        <span>${formatCurrency(price)}</span>
        <button class="remove-product-btn">X</button>
    `;
    container.appendChild(row);

    row.querySelector('.remove-product-btn').onclick = () => {
        row.remove();
        updateInvoiceTotal();
    };
    row.querySelector('.product-qty').oninput = updateInvoiceTotal;

    updateInvoiceTotal();
}

// --- Cập nhật tổng tiền hóa đơn ---
function updateInvoiceTotal() {
    const container = document.getElementById('products-container');
    let total = 0;
    container.querySelectorAll('.product-row').forEach(row => {
        const code = row.dataset.code;
        const qty = Number(row.querySelector('.product-qty').value) || 0;
        const prod = allProducts.find(p => p.code === code);
        if (prod) total += qty * prod.sellPrice;
    });
    document.getElementById('invoice-total-amount').textContent = formatCurrency(total);
}

// --- Lưu hóa đơn mới ---
async function saveInvoice() {
    const code = document.getElementById('new-invoice-id').value;
    const customerCode = document.getElementById('new-customer-name_BH').value;
    const employeeCode = document.getElementById('new-employee_BH').value;
    const type = document.getElementById('new-invoice-type_BH').value;
    const paymentMethod = document.getElementById('new-payment-method_BH').value;
    const status = document.getElementById('new-status_BH').value;

    // Lấy tên khách hàng
    const customer = allCustomers.find(c => c.code === customerCode);
    const customerName = customer ? customer.name : '';
    const phone = customer ? customer.phone : '';

    // Lấy danh sách sản phẩm
    const items = [];
    document.querySelectorAll('#products-container .product-row').forEach(row => {
        const type = row.dataset.type;
        const code = row.dataset.code;
        const qty = Number(row.querySelector('.product-qty').value) || 0;
        if (type === 'product') {
            const prod = allProducts.find(p => p.code === code);
            if (prod && qty > 0) {
                items.push({
                    product_code: prod.code,
                    name: prod.name,
                    quantity: qty,
                    price: prod.sellPrice
                });
            }
        } else if (type === 'package') {
            const pkg = allPackages.find(p => p.code === code);
            if (pkg && qty > 0) {
                items.push({
                    package_code: pkg.code,
                    name: pkg.name,
                    quantity: qty,
                    price: pkg.price
                });
            }
        }
    });

    if (!customerCode || !employeeCode || !items.length) {
        alert('Vui lòng nhập đầy đủ thông tin và chọn sản phẩm!');
        return;
    }

    // Tính tổng tiền
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Gửi lên server
    try {
        const res = await fetch('http://localhost:5000/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                customerName,
                phone,
                totalAmount,
                status,
                type,
                paymentMethod,
                items,
                employee_code: employeeCode
            })
        });
        const data = await res.json();
        if (data.success) {
            alert('Lưu hóa đơn thành công!');
            document.getElementById('sell-modal').style.display = 'none';
            await loadAllData();
            renderInvoiceTable();
        } else {
            alert('Lưu hóa đơn thất bại!');
        }
    } catch (err) {
        alert('Lỗi khi lưu hóa đơn!');
        console.error(err);
    }
}

// --- Modal chỉnh sửa hóa đơn ---
async function openEditInvoiceModal(code) {
    isEditMode = true;
    const res = await fetch(`http://localhost:5000/api/invoices/${code}`);
    if (!res.ok) {
        alert('Không tìm thấy hóa đơn!');
        return;
    }
    const invoice = await res.json();

    // Không cho sửa nếu đã hoàn thành hoặc đã hủy
    if (invoice.status === 'Hoàn thành' || invoice.status === 'Đã hủy') {
        alert('Không thể sửa hóa đơn đã hoàn thành hoặc đã hủy!');
        return;
    }

    // Đổ dữ liệu vào form
    document.getElementById('new-invoice-id').value = invoice.code;
    fillCustomerSelect();
    // Nếu có customerCode thì dùng, nếu không thì tìm theo tên
    if (invoice.customerCode) {
        document.getElementById('new-customer-name_BH').value = invoice.customerCode;
    } else if (invoice.customerName) {
        const found = allCustomers.find(c => c.name === invoice.customerName);
        document.getElementById('new-customer-name_BH').value = found ? found.code : '';
    }
    fillEmployeeSelect();
    document.getElementById('new-employee_BH').value = invoice.employee_code || '';
    document.getElementById('new-invoice-type_BH').value = invoice.type || 'Bán hàng';
    document.getElementById('new-payment-method_BH').value = invoice.paymentMethod || 'Tiền mặt';
    document.getElementById('new-status_BH').value = invoice.status || 'Phiếu tạm';

    // Đổ danh sách sản phẩm
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    (invoice.items || []).forEach(item => {
        let type = 'product';
        let name = item.name;
        let price = item.price;
        if (item.package_code) {
            type = 'package';
            const pkg = allPackages.find(p => p.code === item.package_code);
            if (pkg) {
                name = pkg.name + ' (Gói tập)';
                price = pkg.price;
            }
        } else if (item.product_code) {
            const prod = allProducts.find(p => p.code === item.product_code);
            if (prod) {
                name = prod.name;
                price = prod.sellPrice;
            }
        }
        const row = document.createElement('div');
        row.className = 'product-row';
        row.dataset.type = type;
        row.dataset.code = item.product_code || item.package_code;
        row.innerHTML = `
            <span>${name}</span>
            <input type="number" class="product-qty" min="1" value="${item.quantity}" style="width:60px;">
            <span>${formatCurrency(price)}</span>
            <button class="remove-product-btn">Xóa</button>
        `;
        productsContainer.appendChild(row);

        row.querySelector('.remove-product-btn').onclick = () => {
            row.remove();
            updateInvoiceTotal();
        };
        row.querySelector('.product-qty').oninput = updateInvoiceTotal;
    });
    updateInvoiceTotal();

    document.getElementById('save-invoice-btn').onclick = function () {
        updateInvoice(code);
    };
    document.getElementById('sell-modal').style.display = 'flex';
}

// --- Cập nhật hóa đơn ---
async function updateInvoice(code) {
    const employeeCode = document.getElementById('new-employee_BH').value;
    const type = document.getElementById('new-invoice-type_BH').value;
    const paymentMethod = document.getElementById('new-payment-method_BH').value;
    const status = document.getElementById('new-status_BH').value;

    // Lấy danh sách sản phẩm
    const items = [];
    document.querySelectorAll('#products-container .product-row').forEach(row => {
        const type = row.dataset.type;
        const code = row.dataset.code;
        const qty = Number(row.querySelector('.product-qty').value) || 0;
        if (type === 'product') {
            const prod = allProducts.find(p => p.code === code);
            if (prod && qty > 0) {
                items.push({
                    product_code: prod.code,
                    name: prod.name,
                    quantity: qty,
                    price: prod.sellPrice
                });
            }
        } else if (type === 'package') {
            const pkg = allPackages.find(p => p.code === code);
            if (pkg && qty > 0) {
                items.push({
                    package_code: pkg.code,
                    name: pkg.name,
                    quantity: qty,
                    price: pkg.price
                });
            }
        }
    });

    if (!employeeCode || !items.length) {
        alert('Vui lòng nhập đầy đủ thông tin và chọn sản phẩm!');
        return;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
        const res = await fetch(`http://localhost:5000/api/invoices/${code}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                totalAmount,
                status,
                type,
                paymentMethod,
                items,
                employee_code: employeeCode
            })
        });
        const data = await res.json();
        if (data.success) {
            alert('Cập nhật hóa đơn thành công!');
            document.getElementById('sell-modal').style.display = 'none';
            await loadAllData();
            renderInvoiceTable();
        } else {
            alert('Cập nhật hóa đơn thất bại!');
        }
    } catch (err) {
        alert('Lỗi khi cập nhật hóa đơn!');
        console.error(err);
    }
}

// Thêm hàm exportToExcel vào cuối file
function exportToExcel() {
    // Lấy dữ liệu đã lọc
    const filteredInvoices = getFilteredInvoices();
    
    // Chuẩn bị dữ liệu cho Excel
    const excelData = filteredInvoices.map(invoice => {
        // Tính tổng số lượng sản phẩm
        const totalItems = (invoice.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        // Tạo danh sách sản phẩm dạng text
        const itemsList = (invoice.items || []).map(item => 
            `${item.name} (${item.quantity} x ${formatCurrency(item.price)})`
        ).join('\n');

        return {
            'Mã hóa đơn': invoice.code,
            'Thời gian': formatDate(invoice.time),
            'Tên khách hàng': invoice.customerName || '',
            'Nhân viên nhập': getEmployeeName(invoice.employee_code),
            'Loại hóa đơn': invoice.type || '',
            'Phương thức thanh toán': invoice.paymentMethod || '',
            'Trạng thái': invoice.status || '',
            'Tổng số lượng': totalItems,
            'Danh sách sản phẩm': itemsList,
            'Tổng tiền': formatCurrency(invoice.totalAmount)
        };
    });

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    const wscols = [
        {wch: 15}, // Mã hóa đơn
        {wch: 15}, // Thời gian
        {wch: 25}, // Tên khách hàng
        {wch: 20}, // Nhân viên nhập
        {wch: 15}, // Loại hóa đơn
        {wch: 20}, // Phương thức thanh toán
        {wch: 15}, // Trạng thái
        {wch: 15}, // Tổng số lượng
        {wch: 50}, // Danh sách sản phẩm
        {wch: 20}  // Tổng tiền
    ];
    ws['!cols'] = wscols;

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách hóa đơn");

    // Tạo tên file với ngày hiện tại
    const today = new Date();
    const fileName = `Danh_sach_hoa_don_${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;

    // Xuất file Excel
    XLSX.writeFile(wb, fileName);
}