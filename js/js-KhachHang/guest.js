// js/js-KhachHang/guest.js

let currentPage = 1;
const recordsPerPage = 10;
let allCustomers = [];
let availablePackages = []; // Store packages here
let currentEditingCustomerPackageCode = null; // Biến để lưu customer_package_code khi sửa

document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
  loadPackages();

  // Thêm event listeners cho các nút
  document.querySelector(".btn-add").onclick = () => {
    document.getElementById("add-form").style.display = "block";
    document.getElementById("add-form-overlay").style.display = "block";
    // Reset và tính lại ngày kết thúc khi mở form thêm
    document.getElementById("customer-add-form").reset();
    calculateEndDate('add');
  };

  document.querySelector(".btn-search").onclick = () => {
    const searchValue = document.getElementById("searchInput").value.trim();
    if (searchValue) {
      searchCustomer(searchValue);
    } else {
      loadCustomers();
    }
  };

  // Thêm event listener cho nút xuất Excel
  document.querySelector(".btn-export").onclick = exportToExcel;

  // Form thêm khách hàng
  document.getElementById("customer-add-form").onsubmit = (e) => {
    e.preventDefault();
    addCustomer();
  };

  // Add event listeners for calculating end date on add form
  document.getElementById('addStartDate').addEventListener('change', () => calculateEndDate('add'));
  document.getElementById('addCardType').addEventListener('change', () => calculateEndDate('add'));

  document.getElementById("customer-edit-form").onsubmit = async function (e) {
    e.preventDefault();

    const customerCode = document.getElementById("edit-id").value; // Mã khách hàng
    const name = document.getElementById("edit-name").value;
    const birthdate = document.getElementById("edit-birthdate").value;
    const gender = document.getElementById("edit-gender").value;
    const address = document.getElementById("edit-address").value;
    const phone = document.getElementById("edit-phone").value;

    // Thông tin gói tập
    const packageName = document.getElementById("edit-cardType").value;
    const start_date = document.getElementById("edit-startDate").value;
    const end_date = document.getElementById("edit-endDate").value; // Lấy giá trị đã tính
    const packageStatus = document.getElementById("edit-status").value;
    const customerPackageCode = currentEditingCustomerPackageCode; // Mã gói tập khách hàng (từ bảng customer_packages)

    // Tìm package_code từ packageName
    const selectedPackage = availablePackages.find(pkg => pkg.name === packageName);
    if (!selectedPackage) {
        alert("Không tìm thấy thông tin gói tập đã chọn!");
        return;
    }
    const package_code = selectedPackage.code; // Mã gói tập (từ bảng packages)

    try {
        // 1. Cập nhật khách hàng (bảng customers)
        const customerUpdateResponse = await fetch(`http://localhost:5000/api/customers/${customerCode}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, birthdate, gender, address, phone }),
        });

        if (!customerUpdateResponse.ok) {
             const errorDetail = await customerUpdateResponse.json();
             throw new Error(errorDetail.message || 'Lỗi khi cập nhật thông tin khách hàng.');
        }

        // 2. Cập nhật gói tập khách hàng (bảng customer_packages)
        // Cần kiểm tra xem customerPackageCode có tồn tại không.
        // Nếu không tồn tại (khách hàng cũ chưa có gói nào), có thể cần tạo mới POST thay vì PUT.
        // Tuy nhiên, logic hiện tại của backend GET /customers chỉ trả về khách hàng CÓ gói gần nhất.
        // Nếu khách hàng không có gói nào thì customer_package_code sẽ là null.
        // Xử lý trường hợp khách hàng chưa có gói nào: POST thay vì PUT
        if (!customerPackageCode) {
            const addPackageResponse = await fetch("http://localhost:5000/api/customer_packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_code: customerCode, // Mã khách hàng
                    package_code: package_code, // Mã gói tập
                    start_date: start_date,
                    end_date: end_date,
                    status: packageStatus,
                }),
            });

             if (!addPackageResponse.ok) {
                 const errorDetail = await addPackageResponse.json();
                 throw new Error(errorDetail.message || 'Lỗi khi thêm gói tập mới cho khách hàng.');
             }

        } else {
            // Trường hợp khách hàng đã có gói: PUT để cập nhật gói gần nhất
            const packageUpdateResponse = await fetch(`http://localhost:5000/api/customer_packages/${customerPackageCode}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    package_code: package_code, // Mã gói tập
                    start_date: start_date,
                    end_date: end_date,
                    status: packageStatus,
                }),
            });

            if (!packageUpdateResponse.ok) {
                const errorDetail = await packageUpdateResponse.json();
                throw new Error(errorDetail.message || 'Lỗi khi cập nhật thông tin gói tập.');
            }
        }

        alert("Cập nhật thành công!");
        document.getElementById("edit-form").style.display = "none";
        document.getElementById("edit-form-overlay").style.display = "none";
        loadCustomers(); // Tải lại dữ liệu sau khi cập nhật thành công cả hai
        currentEditingCustomerPackageCode = null; // Reset biến tạm

    } catch (err) {
        console.error('Lỗi trong quá trình cập nhật:', err);
        alert("Lỗi cập nhật: " + err.message);
    }
  };

  // Add event listeners for calculating end date on edit form
  document.getElementById('edit-startDate').addEventListener('change', () => calculateEndDate('edit'));
  document.getElementById('edit-cardType').addEventListener('change', () => calculateEndDate('edit'));
});

function loadCustomers() {
  fetch("http://localhost:5000/api/customers")
    .then((res) => res.json())
    .then((data) => {
      allCustomers = data; // Lưu toàn bộ dữ liệu, bao gồm customer_package_code
      renderTableWithPagination();
    })
    .catch((err) => {
      alert("Không thể tải danh sách khách hàng!");
    });
}

function loadPackages() {
  console.log("Đang tải danh sách gói tập...");
  fetch("http://localhost:5000/api/packages")
    .then((res) => {
      console.log("Response status:", res.status);
      return res.json();
    })
    .then((data) => {
      console.log("Dữ liệu gói tập nhận được:", data);
      availablePackages = data; // Store loaded packages

      const addSelect = document.getElementById("addCardType");
      const editSelect = document.getElementById("edit-cardType");

      // Xóa options cũ
      addSelect.innerHTML = "";
      editSelect.innerHTML = "";

      // Thêm options mới
      data.forEach((pkg) => {
        const addOpt = document.createElement("option");
        addOpt.value = pkg.name;
        addOpt.textContent = pkg.name;
        addSelect.appendChild(addOpt);

        const editOpt = document.createElement("option");
        editOpt.value = pkg.name;
        editOpt.textContent = pkg.name;
        editSelect.appendChild(editOpt);
      });
    })
    .catch((err) => {
      console.error("Lỗi khi tải danh sách gói tập:", err);
      alert("Không thể tải danh sách gói tập!");
    });
}

function renderTable(customers) {
  const tbody = document.querySelector(".customer-table tbody");
  tbody.innerHTML = "";
  customers.forEach((c, idx) => {
    const startDate = c.start_date ? formatDate(c.start_date) : "";
    const endDate = c.end_date ? formatDate(c.end_date) : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${c.name}</td>
      <td>${c.birthdate ? formatDate(c.birthdate) : ""}</td>
      <td>${c.gender || ""}</td>
      <td>${c.address || ""}</td>
      <td>${c.phone || ""}</td>
      <td>${c.packageName || ""}</td>
      <td>${c.start_date ? formatDate(c.start_date) : ""}</td>
      <td>${c.end_date ? formatDate(c.end_date) : ""}</td>
      <td>${c.packageStatus || ""}</td>
      <td>
        <button onclick="editCustomer('${c.code}')">Sửa</button>
        <button onclick="deleteCustomer('${c.code}')">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTableWithPagination() {
  const tbody = document.querySelector(".customer-table tbody");
  tbody.innerHTML = "";

  const startIdx = (currentPage - 1) * recordsPerPage;
  const endIdx = startIdx + recordsPerPage;
  const pageData = allCustomers.slice(startIdx, endIdx);

  pageData.forEach((c, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${startIdx + idx + 1}</td>
      <td>${c.name}</td>
      <td>${c.birthdate ? formatDate(c.birthdate) : ""}</td>
      <td>${c.gender || ""}</td>
      <td>${c.address || ""}</td>
      <td>${c.phone || ""}</td>
      <td>${c.packageName || ""}</td>
      <td>${c.start_date ? formatDate(c.start_date) : ""}</td>
      <td>${c.end_date ? formatDate(c.end_date) : ""}</td>
      <td>${c.packageStatus || ""}</td>
      <td>
        <button onclick="editCustomer('${c.code}')">Sửa</button>
        <button onclick="deleteCustomer('${c.code}')">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination();
}

function renderPagination() {
  let pagination = document.getElementById("customer-pagination");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "customer-pagination";
    pagination.style.margin = "16px 0";
    document.querySelector(".customer-table").after(pagination);
  }
  pagination.innerHTML = "";

  const totalPages = Math.ceil(allCustomers.length / recordsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.onclick = () => {
      currentPage = i;
      renderTableWithPagination();
    };
    pagination.appendChild(btn);
  }
}

function formatDate(yyyyMMdd) {
  if (!yyyyMMdd) return "";
  const d = new Date(yyyyMMdd);
  if (isNaN(d)) return yyyyMMdd;
  return d.toLocaleDateString("vi-VN");
}

function closeAddForm() {
  document.getElementById("add-form").style.display = "none";
  document.getElementById("add-form-overlay").style.display = "none";
  document.getElementById("customer-add-form").reset();
}

function calculateEndDate(formType) { // formType is 'add' or 'edit'
    const startDateInput = document.getElementById(`${formType === 'add' ? 'addStartDate' : 'edit-startDate'}`);
    const packageSelect = document.getElementById(`${formType === 'add' ? 'addCardType' : 'edit-cardType'}`);
    const endDateInput = document.getElementById(`${formType === 'add' ? 'addEndDate' : 'edit-endDate'}`);

    const start_date = startDateInput.value;
    const packageName = packageSelect.value;

    if (!start_date || !packageName || availablePackages.length === 0) {
        endDateInput.value = '';
        return;
    }

    const selectedPackage = availablePackages.find(pkg => pkg.name === packageName);

    if (!selectedPackage || !selectedPackage.duration) {
         endDateInput.value = '';
         console.warn(`Không tìm thấy gói tập ${packageName} hoặc không có thông tin thời hạn.`);
         return;
    }

    const durationInDays = selectedPackage.duration; // Lấy duration (số ngày)

    try {
        const startDateObj = new Date(start_date);
        // Check if date is valid
        if (isNaN(startDateObj.getTime())) {
             endDateInput.value = '';
             console.error('Ngày bắt đầu không hợp lệ!');
             return;
        }

        const endDateObj = new Date(startDateObj);
        // Cộng số ngày (durationInDays) vào ngày bắt đầu
        endDateObj.setDate(startDateObj.getDate() + durationInDays);

        // Format YYYY-MM-DD
        const end_date = endDateObj.toISOString().split('T')[0];
        endDateInput.value = end_date;

    } catch (error) {
        console.error('Lỗi khi tính ngày kết thúc:', error);
        endDateInput.value = '';
    }
}

function addCustomer() {
  // Lấy dữ liệu từ form khách hàng
  const name = document.getElementById("addName").value;
  const birthdate = document.getElementById("addBirthdate").value;
  const gender = document.getElementById("addGender").value;
  const address = document.getElementById("addAddress").value;
  const phone = document.getElementById("addPhone").value;

  // Lấy dữ liệu từ form gói tập
  const packageName = document.getElementById("addCardType").value;
  const start_date = document.getElementById("addStartDate").value;
  const end_date = document.getElementById("addEndDate").value; // Lấy end_date từ input (đã được tính tự động)
  const status = "Còn hạn"; // Mặc định trạng thái khi thêm mới

  // Tìm package_code và duration từ packageName
  const selectedPackage = availablePackages.find(pkg => pkg.name === packageName);
  if (!selectedPackage) {
      alert("Không tìm thấy thông tin gói tập đã chọn!");
      return;
  }
  const package_code = selectedPackage.code;
  // duration không cần ở đây nữa vì end_date đã được tính ở trên

  // 1. Thêm khách hàng
  fetch("http://localhost:5000/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, birthdate, gender, address, phone }),
  })
    .then((res) => {
        if (!res.ok) {
             // Try to read response body for error message
            return res.json().then(err => { throw new Error(err.message || 'Lỗi khi thêm khách hàng'); });
        }
        return res.json();
    })
    .then((customer) => {
        if (!customer.success || !customer.code) {
             throw new Error(customer.message || 'Không nhận được mã khách hàng sau khi thêm.');
        }
        // 2. Thêm gói tập cho khách hàng vừa tạo
      return fetch("http://localhost:5000/api/customer_packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_code: customer.code, // code trả về từ API
          package_code: package_code, // Sử dụng package_code đã tìm được
          start_date: start_date,
          end_date: end_date, // Sử dụng end_date đã tính
          status: status,
        }),
      });
    })
    .then((res) => {
        if (!res.ok) {
            return res.json().then(err => { throw new Error(err.message || 'Lỗi khi thêm gói tập khách hàng'); });
        }
        return res.json();
    })
    .then(() => {
      alert("Thêm khách hàng và gói tập thành công!");
      closeAddForm();
      loadCustomers();
    })
    .catch((err) => {
        console.error("Lỗi trong quá trình thêm khách hàng/gói tập:", err);
        alert("Lỗi: " + err.message);
    });
}

function editCustomer(code) {
  // Tìm khách hàng trong dữ liệu đã tải (đã bao gồm customer_package_code)
  const c = allCustomers.find((x) => x.code === code);
  if (!c) {
      alert("Không tìm thấy thông tin khách hàng để sửa.");
      return;
  }

  // Lưu customer_package_code của gói tập gần nhất để sử dụng khi lưu
  currentEditingCustomerPackageCode = c.customer_package_code;

  document.getElementById("edit-id").value = c.code; // Mã khách hàng
  document.getElementById("edit-name").value = c.name;
  document.getElementById("edit-birthdate").value = c.birthdate
    ? c.birthdate.split("T")[0]
    : "";
  document.getElementById("edit-gender").value = c.gender || "";
  document.getElementById("edit-address").value = c.address || "";
  document.getElementById("edit-phone").value = c.phone || "";

  // Điền thông tin gói tập
  document.getElementById("edit-cardType").value = c.packageName || "";
  document.getElementById("edit-startDate").value = c.start_date
    ? c.start_date.split("T")[0]
    : "";
  // Ngày kết thúc sẽ được tính tự động sau khi điền ngày bắt đầu và loại thẻ
  document.getElementById("edit-endDate").value = c.end_date
    ? c.end_date.split("T")[0]
    : ""; // Điền giá trị ban đầu (có thể bị ghi đè khi calculateEndDate chạy)
  document.getElementById("edit-status").value = c.packageStatus || "";

  // Tính toán và hiển thị ngày kết thúc ngay khi mở form
  calculateEndDate('edit'); // Gọi hàm tính toán sau khi điền dữ liệu

  document.getElementById("edit-form").style.display = "block";
  document.getElementById("edit-form-overlay").style.display = "block";
}

function deleteCustomer(code) {
  if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;
  fetch(`http://localhost:5000/api/customers/${code}`, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) throw new Error("Lỗi khi xóa khách hàng");
      return res.json();
    })
    .then(() => {
      alert("Xóa thành công!");
      loadCustomers();
    })
    .catch((err) => alert(err.message));
}

function searchCustomer(name) {
  fetch(
    `http://localhost:5000/api/customers/search?name=${encodeURIComponent(name)}`
  )
    .then((res) => res.json())
    .then((data) => renderTable(data))
    .catch((err) => alert("Lỗi tìm kiếm khách hàng!"));
}

// Thêm hàm exportToExcel vào cuối file
function exportToExcel() {
  // Chuẩn bị dữ liệu cho Excel
  const excelData = allCustomers.map(customer => ({
    'ID': customer.code,
    'Tên khách hàng': customer.name,
    'Ngày sinh': customer.birthdate ? formatDate(customer.birthdate) : '',
    'Giới tính': customer.gender || '',
    'Địa chỉ': customer.address || '',
    'Số điện thoại': customer.phone || '',
    'Loại thẻ': customer.packageName || '',
    'Ngày bắt đầu': customer.start_date ? formatDate(customer.start_date) : '',
    'Ngày kết thúc': customer.end_date ? formatDate(customer.end_date) : '',
    'Trạng thái': customer.packageStatus || ''
  }));

  // Tạo worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Tạo workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách khách hàng");

  // Tạo tên file với ngày hiện tại
  const today = new Date();
  const fileName = `Danh_sach_khach_hang_${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}.xlsx`;

  // Xuất file Excel
  XLSX.writeFile(wb, fileName);
}