// Dữ liệu mẫu: 20 bản ghi
const transactions = [
  {
    maPhieu: "PT001",
    thoiGian: "01/04/2025 10:00",
    loaiThuChi: "Thu bán hàng",
    nguoiNopNhan: "Nguyễn Văn A",
    ghiChu: "Thanh toán phí tập tháng 4",
    giaTri: "+2,500,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 1",
  },
  {
    maPhieu: "PC001",
    thoiGian: "02/04/2025 14:30",
    loaiThuChi: "Chi tiền lương",
    nguoiNopNhan: "Trần Thị B",
    ghiChu: "Lương PT tháng 3",
    giaTri: "-5,000,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 2",
  },
  {
    maPhieu: "PT002",
    thoiGian: "03/04/2025 09:15",
    loaiThuChi: "Thu đối tác",
    nguoiNopNhan: "Công ty Dinh Dưỡng XYZ",
    ghiChu: "Thanh toán hợp đồng quảng cáo",
    giaTri: "+10,000,000",
    trangThai: "Đang chờ",
    taiKhoanNganHang: "Ngân hàng 3",
  },
  {
    maPhieu: "PC002",
    thoiGian: "04/04/2025 16:00",
    loaiThuChi: "Chi đầu tư văn phòng",
    nguoiNopNhan: "Nhà cung cấp ABC",
    ghiChu: "Mua thiết bị tập gym",
    giaTri: "-15,000,000",
    trangThai: "Chưa thanh toán",
    taiKhoanNganHang: "Ngân hàng 1",
  },
  {
    maPhieu: "PT003",
    thoiGian: "05/04/2025 11:20",
    loaiThuChi: "Thu khác",
    nguoiNopNhan: "Lê Văn C",
    ghiChu: "Đóng phí trễ hạn",
    giaTri: "+200,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 2",
  },
  {
    maPhieu: "PT004",
    thoiGian: "06/04/2025 13:45",
    loaiThuChi: "Thu bán hàng",
    nguoiNopNhan: "Phạm Thị D",
    ghiChu: "Thanh toán phí tập tháng 4",
    giaTri: "+2,500,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 3",
  },
  {
    maPhieu: "PC003",
    thoiGian: "07/04/2025 08:30",
    loaiThuChi: "Chi đối tác",
    nguoiNopNhan: "Công ty Thể Thao DEF",
    ghiChu: "Thanh toán hợp đồng bảo trì thiết bị",
    giaTri: "-3,000,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 1",
  },
  {
    maPhieu: "PT005",
    thoiGian: "08/04/2025 15:00",
    loaiThuChi: "Thu bán hàng",
    nguoiNopNhan: "Hoàng Văn E",
    ghiChu: "Thanh toán phí tập tháng 4",
    giaTri: "+2,500,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 2",
  },
  {
    maPhieu: "PC004",
    thoiGian: "09/04/2025 10:00",
    loaiThuChi: "Chi tiền lương",
    nguoiNopNhan: "Nguyễn Thị F",
    ghiChu: "Lương PT tháng 3",
    giaTri: "-5,000,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 3",
  },
  {
    maPhieu: "PT006",
    thoiGian: "10/04/2025 12:30",
    loaiThuChi: "Thu khác",
    nguoiNopNhan: "Trần Văn G",
    ghiChu: "Đóng phí trễ hạn",
    giaTri: "+200,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 1",
  },
  {
    maPhieu: "PC005",
    thoiGian: "11/04/2025 09:00",
    loaiThuChi: "Chi tiêu khác",
    nguoiNopNhan: "Nhà cung cấp GHI",
    ghiChu: "Mua nước uống cho phòng gym",
    giaTri: "-1,000,000",
    trangThai: "Chưa thanh toán",
    taiKhoanNganHang: "Ngân hàng 2",
  },
  {
    maPhieu: "PT007",
    thoiGian: "12/04/2025 14:00",
    loaiThuChi: "Thu bán hàng",
    nguoiNopNhan: "Lê Thị H",
    ghiChu: "Thanh toán phí tập tháng 4",
    giaTri: "+2,500,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 3",
  },
  {
    maPhieu: "PC006",
    thoiGian: "13/04/2025 16:45",
    loaiThuChi: "Chi đầu tư văn phòng",
    nguoiNopNhan: "Nhà cung cấp JKL",
    ghiChu: "Mua máy chạy bộ mới",
    giaTri: "-20,000,000",
    trangThai: "Chưa thanh toán",
    taiKhoanNganHang: "Ngân hàng 1",
  },
  {
    maPhieu: "PT008",
    thoiGian: "14/04/2025 11:00",
    loaiThuChi: "Thu đối tác",
    nguoiNopNhan: "Công ty Thực Phẩm MNO",
    ghiChu: "Thanh toán hợp đồng tài trợ",
    giaTri: "+8,000,000",
    trangThai: "Đang chờ",
    taiKhoanNganHang: "Ngân hàng 2",
  },
  {
    maPhieu: "PC007",
    thoiGian: "15/04/2025 13:30",
    loaiThuChi: "Chi tiền lương",
    nguoiNopNhan: "Phạm Văn I",
    ghiChu: "Lương PT tháng 3",
    giaTri: "-5,000,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 3",
  },
  {
    maPhieu: "PT009",
    thoiGian: "16/04/2025 10:15",
    loaiThuChi: "Thu bán hàng",
    nguoiNopNhan: "Nguyễn Thị K",
    ghiChu: "Thanh toán phí tập tháng 4",
    giaTri: "+2,500,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 1",
  },
  {
    maPhieu: "PC008",
    thoiGian: "17/04/2025 15:00",
    loaiThuChi: "Chi đối tác",
    nguoiNopNhan: "Công ty PQR",
    ghiChu: "Thanh toán hợp đồng quảng cáo",
    giaTri: "-4,000,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 2",
  },
  {
    maPhieu: "PT010",
    thoiGian: "18/04/2025 09:30",
    loaiThuChi: "Thu khác",
    nguoiNopNhan: "Trần Văn L",
    ghiChu: "Đóng phí trễ hạn",
    giaTri: "+200,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 3",
  },
  {
    maPhieu: "PC009",
    thoiGian: "19/04/2025 14:00",
    loaiThuChi: "Chi tiêu khác",
    nguoiNopNhan: "Nhà cung cấp STU",
    ghiChu: "Mua khăn lau cho phòng gym",
    giaTri: "-500,000",
    trangThai: "Chưa thanh toán",
    taiKhoanNganHang: "Ngân hàng 1",
  },
  {
    maPhieu: "PT011",
    thoiGian: "20/04/2025 11:45",
    loaiThuChi: "Thu bán hàng",
    nguoiNopNhan: "Lê Văn M",
    ghiChu: "Thanh toán phí tập tháng 4",
    giaTri: "+2,500,000",
    trangThai: "Đã thanh toán",
    taiKhoanNganHang: "Ngân hàng 2",
  },
];

// Biến toàn cục
let currentPage = 1;
let pageSize = 10;
let filteredData = transactions;

// Danh sách các tùy chọn "Loại thu chi" cho từng tab
const filterOptions = {
  cash: [
    { value: "all", text: "Tất cả" },
    { value: "income", text: "Thu nhập" },
    { value: "sales", text: "Thu bán hàng" },
    { value: "partners", text: "Thu đối tác" },
    { value: "other-income", text: "Thu khác" },
    { value: "office-investment", text: "Chi đầu tư văn phòng" },
    { value: "partner-expense", text: "Chi đối tác" },
    { value: "salary", text: "Chi tiền lương" },
    { value: "other-expense", text: "Chi tiêu khác" },
  ],
  bank: [
    { value: "all", text: "Tất cả" },
    { value: "bank-income", text: "Thu qua ngân hàng" },
    { value: "bank-transfer", text: "Chuyển khoản ngân hàng" },
    { value: "bank-expense", text: "Chi qua ngân hàng" },
    { value: "partner-bank", text: "Chi đối tác qua ngân hàng" },
    { value: "salary-bank", text: "Chi lương qua ngân hàng" },
  ],
  total: [
    { value: "all", text: "Tất cả" },
    { value: "total-income", text: "Tổng thu" },
    { value: "total-expense", text: "Tổng chi" },
    { value: "total-balance", text: "Số dư tổng quỹ" },
  ],
};

// Tổng hợp tất cả logic vào một hàm chính
function initializeApp() {
  // --- Note 1: Khởi tạo các phần tử DOM ---
  const items = document.querySelectorAll(".summary-item");
  const bankAccountSection = document.querySelector(".bank-account-section");
  const filterSection = document.querySelector(".form-sub-lsb");
  const filterTitle = filterSection?.querySelector(".title-sub-lsb");
  const filterCategoryDropdown = document.querySelector(
    ".filter-category-dropdown"
  );
  const selectedCategory = document.querySelector("#selected-category");
  const filterCategoryContainer = document.querySelector(
    ".filter-category-container"
  );
  const bankAccountDropdown = document.querySelector(
    ".bank-account-section .custom-dropdown"
  );
  const selectedBankAccount = document.querySelector("#selected-bank-account");
  const statusFilter = document.getElementById("status-filter");
  const selectedStatus = statusFilter?.querySelector(".custom-filter-selected");
  const statusDropdown = statusFilter?.querySelector(".custom-filter-dropdown");
  const statusItems = statusFilter?.querySelectorAll(".filter-item");
  const selectedStatusText = statusFilter?.querySelector("#selected-status");
  const clearStatusBtn = statusFilter?.querySelector("#clear-status");
  const categoryFilter = document.getElementById("filter-category");
  const selectedCategoryFilter = categoryFilter?.querySelector(
    ".filter-category-selected"
  );
  const categoryDropdown = categoryFilter?.querySelector(
    ".filter-category-dropdown"
  );
  const categoryItems = categoryFilter?.querySelectorAll(
    ".filter-category-item"
  );
  const selectedCategoryText =
    categoryFilter?.querySelector("#selected-category");
  const titleBar = document.querySelector(".title-sub-lsb");
  const formContent = document.querySelector(".depositor-recipient-content");
  const arrowIcon = titleBar?.querySelector("i");
  const selectedOption = document.querySelector(".selected-option");
  const dropdownOptions = document.querySelector(".dropdown-options");
  const options = document.querySelectorAll(".dropdown-option");
  const selectedPersonText = document.getElementById("selected-person");
  const nameInput = document.getElementById("depositor-name");
  const phoneInput = document.getElementById("depositor-phone");

  // --- Note 2: Hàm cập nhật nội dung tab ---
  function updateTabContent(tab) {
    if (bankAccountSection)
      bankAccountSection.style.display = tab === "bank" ? "block" : "none";
    if (filterCategoryDropdown && selectedCategory) {
      filterCategoryDropdown.innerHTML = "";
      filterOptions[tab].forEach((option) => {
        const div = document.createElement("div");
        div.className = "filter-category-item";
        div.setAttribute("data-value", option.value);
        div.textContent = option.text;
        div.addEventListener("click", () => {
          selectedCategory.textContent = div.textContent;
          filterCategoryDropdown.parentElement.classList.remove("show");
        });
        filterCategoryDropdown.appendChild(div);
      });
      selectedCategory.textContent = "Tất cả";
    }
  }
  function getStatusClass(status) {
    switch (status) {
      case "Đã thanh toán":
      case "Hoàn thành":
        return "status-completed";
      case "Đang chờ":
      case "Phiếu tạm":
        return "status-pending";
      case "Chưa thanh toán":
      case "Đã hủy":
        return "status-cancelled";
      default:
        return "";
    }
  }

  // --- Note 3: Hàm chung để thiết lập dropdown ---
  function setupDropdown(
    selectedElement,
    dropdownElement,
    items,
    selectedTextElement,
    clearBtn = null
  ) {
    if (selectedElement && dropdownElement) {
      selectedElement.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        dropdownElement.classList.toggle("show");
      });
      items.forEach((item) => {
        item.addEventListener("click", () => {
          selectedTextElement.textContent = item.textContent;
          selectedTextElement.setAttribute(
            "data-value",
            item.getAttribute("data-value")
          );
          dropdownElement.classList.remove("show");
          if (clearBtn)
            clearBtn.style.display =
              item.dataset.value !== "all" ? "block" : "none";
          applyFilters();
        });
      });
    }
  }

  // --- Note 4: Hàm đóng tất cả dropdown ---
  function closeAllDropdowns() {
    document
      .querySelectorAll(
        ".custom-filter-dropdown, .filter-category-dropdown, .dropdown-options"
      )
      .forEach((dropdown) => dropdown.classList.remove("show"));
  }

  function getStatusClass(status) {
    switch (status) {
      case "Đã thanh toán":
      case "Hoàn thành":
        return "status-completed";
      case "Đang chờ":
      case "Phiếu tạm":
        return "status-pending";
      case "Chưa thanh toán":
      case "Đã hủy":
        return "status-cancelled";
      default:
        return "";
    }
  }

  // --- Note 5: Hàm hiển thị bảng dữ liệu ---
  function populateTable(data, page = 1, pageSize = 10) {
    const tbody = document.querySelector(".data-table-container tbody");
    const totalRecords = document.getElementById("total-records");
    const prevButton = document.querySelector(
      ".pagination-controls .btn:first-child"
    );
    const nextButton = document.querySelector(
      ".pagination-controls .btn:last-child"
    );
    const currentPageElement = document.querySelector(
      ".pagination-controls .current-page"
    );

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);

    tbody.innerHTML =
      pageData.length === 0
        ? '<tr class="no-data"><td colspan="8">Không có dữ liệu phù hợp</td></tr>'
        : pageData
            .map(
              (item, index) => `
        <tr>
          <td>${item.maPhieu}</td>
          <td>${item.thoiGian}</td>
          <td>${item.loaiThuChi}</td>
          <td>${item.nguoiNopNhan}</td>
          <td>${item.ghiChu}</td>
          <td class="${
            item.giaTri.startsWith("-") ? "text-danger" : "text-success"
          }">${item.giaTri}</td>
          <td>
  <span class="status-badge ${getStatusClass(item.trangThai)}">${
                item.trangThai
              }</span>
          </td>

          <td>
            <button class="btn btn-sm btn-light edit-btn" data-index="${
              (page - 1) * pageSize + index
            }"><i class="fa-solid fa-edit"></i></button>
            <button class="btn btn-sm btn-light delete-btn" data-index="${
              (page - 1) * pageSize + index
            }"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `
            )
            .join("");

    totalRecords.textContent = data.length;
    currentPageElement.textContent = page;
    prevButton.disabled = page === 1;
    nextButton.disabled = end >= data.length;
    attachRowActions();
  }

  // --- Note 6: Hàm lọc dữ liệu ---
  function filterData(searchTerm, searchCriteria) {
    if (!searchTerm) return transactions;
    searchTerm = searchTerm.toLowerCase();
    return transactions.filter((item) => {
      switch (searchCriteria) {
        case "Mã phiếu":
          return item.maPhieu.toLowerCase().includes(searchTerm);
        case "Người nộp/nhận":
          return item.nguoiNopNhan.toLowerCase().includes(searchTerm);
        case "Ghi chú":
          return item.ghiChu.toLowerCase().includes(searchTerm);
        default:
          return true;
      }
    });
  }

  // --- Note 7: Hàm xử lý sự kiện chỉnh sửa/xóa ---
  function attachRowActions() {
    const editButtons = document.querySelectorAll(".edit-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");
    const modal = document.getElementById("editModal");
    const closeModal = document.querySelector(".modal .close");
    const editForm = document.getElementById("editForm");
    const cancelEdit = document.getElementById("cancelEdit");

    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        const item = filteredData[index];
        if (confirm(`Bạn có chắc muốn xóa phiếu ${item.maPhieu}?`)) {
          const idx = transactions.findIndex((t) => t.maPhieu === item.maPhieu);
          if (idx !== -1) transactions.splice(idx, 1);
          filteredData = filterData(
            document.querySelector(".search-bar input")?.value || "",
            document.querySelector(".search-bar select")?.value || ""
          );
          populateTable(filteredData, currentPage, pageSize);
          updateSummary();
        }
      });
    });

    editButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        const item = filteredData[index];
        document.getElementById("editMaPhieu").value = item.maPhieu;
        document.getElementById("editThoiGian").value = item.thoiGian;
        document.getElementById("editLoaiThuChi").value = item.loaiThuChi;
        document.getElementById("editNguoiNopNhan").value = item.nguoiNopNhan;
        document.getElementById("editGhiChu").value = item.ghiChu;
        document.getElementById("editGiaTri").value = item.giaTri.replace(
          /[+,-]/g,
          ""
        );
        document.getElementById("editGiaTriType").value =
          item.giaTri.startsWith("-") ? "-" : "+";
        document.getElementById("editTrangThai").value = item.trangThai;
        modal.style.display = "block";
      });
    });

    closeModal?.addEventListener("click", () => (modal.style.display = "none"));
    cancelEdit?.addEventListener("click", () => (modal.style.display = "none"));
    window.addEventListener("click", (event) => {
      if (event.target === modal) modal.style.display = "none";
    });

    editForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const maPhieu = document.getElementById("editMaPhieu").value;
      const giaTriType = document.getElementById("editGiaTriType").value;
      const giaTriValue = document.getElementById("editGiaTri").value;
      const updatedData = {
        maPhieu,
        thoiGian: document.getElementById("editThoiGian").value,
        loaiThuChi: document.getElementById("editLoaiThuChi").value,
        nguoiNopNhan: document.getElementById("editNguoiNopNhan").value,
        ghiChu: document.getElementById("editGhiChu").value,
        giaTri: giaTriType + formatCurrency(giaTriValue),
        trangThai: document.getElementById("editTrangThai").value,
      };
      const idx = transactions.findIndex((t) => t.maPhieu === maPhieu);
      if (idx !== -1) transactions[idx] = updatedData;
      filteredData = filterData(
        document.querySelector(".search-bar input")?.value || "",
        document.querySelector(".search-bar select")?.value || ""
      );
      populateTable(filteredData, currentPage, pageSize);
      updateSummary();
      modal.style.display = "none";
    });
  }

  // --- Note 8: Hàm định dạng số tiền ---
  function formatCurrency(value) {
    const numericValue = value.toString().replace(/[^\d]/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // --- Note 9: Hàm cập nhật tổng số liệu ---
  function updateSummary() {
    let totalIncome = 0,
      totalExpense = 0;
    transactions.forEach((item) => {
      const value = parseInt(item.giaTri.replace(/[^\d]/g, ""));
      if (item.giaTri.startsWith("+")) totalIncome += value;
      else totalExpense += value;
    });
    const balance = totalIncome - totalExpense;
    document.getElementById("total-income").textContent =
      "+" + formatCurrency(totalIncome);
    document.getElementById("total-expense").textContent =
      "-" + formatCurrency(totalExpense);
    document.getElementById("total-balance").textContent =
      (balance >= 0 ? "+" : "") + formatCurrency(balance);
  }

  // --- Note 10: Khởi tạo tab và sự kiện ---
  updateTabContent("cash");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      updateTabContent(item.getAttribute("data-tab"));
    });
  });

  // Sự kiện dropdown "Loại thu chi"
  if (filterCategoryContainer) {
    filterCategoryContainer.addEventListener("click", () =>
      filterCategoryContainer.classList.toggle("show")
    );
    document.addEventListener("click", (e) => {
      if (!filterCategoryContainer.contains(e.target))
        filterCategoryContainer.classList.remove("show");
    });
  }

  // Sự kiện dropdown "Tài khoản ngân hàng"
  if (bankAccountDropdown && selectedBankAccount) {
    selectedBankAccount.addEventListener("click", (e) => {
      e.stopPropagation();
      bankAccountDropdown.classList.toggle("show");
    });
    document
      .querySelectorAll(".bank-account-section .dropdown-option")
      .forEach((option) => {
        option.addEventListener("click", () => {
          selectedBankAccount.textContent = option.textContent;
          selectedBankAccount.setAttribute(
            "data-value",
            option.getAttribute("data-value")
          );
          bankAccountDropdown.classList.remove("show");
        });
      });
    document.addEventListener("click", (e) => {
      if (!bankAccountDropdown.contains(e.target))
        bankAccountDropdown.classList.remove("show");
    });
  }

  // Sự kiện dropdown trạng thái và loại thu chi
  if (statusFilter && selectedStatusText)
    selectedStatusText.textContent = "Tất cả";
  setupDropdown(
    selectedStatus,
    statusDropdown,
    statusItems,
    selectedStatusText,
    clearStatusBtn
  );
  setupDropdown(
    selectedCategoryFilter,
    categoryDropdown,
    categoryItems,
    selectedCategoryText
  );
  if (clearStatusBtn)
    clearStatusBtn.addEventListener("click", () => {
      selectedStatusText.textContent = "Tất cả";
      selectedStatusText.setAttribute("data-value", "all");
      applyFilters();
    });
  document.addEventListener("click", closeAllDropdowns);

  // Sự kiện "Bộ lọc tìm kiếm"
  if (filterTitle)
    filterTitle.addEventListener("click", () =>
      filterSection.classList.toggle("collapsed")
    );

  // Note: Sửa sự kiện nút loại chứng từ để đảm bảo hoạt động
  const typeButtons = document.querySelectorAll("#chon-1 button");
  typeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      typeButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      applyFilters();
      console.log("Loại chứng từ được chọn:", this.dataset.type); // Note: Thêm console.log để debug
    });
  });

  // Sự kiện nút áp dụng bộ lọc
  const applyFilterButton = document.querySelector(".btn-apply-filter");
  if (applyFilterButton) {
    applyFilterButton.addEventListener("click", () => {
      console.log("Nút Áp dụng bộ lọc được click"); // Debug để kiểm tra sự kiện
      applyFilters(); // Gọi hàm áp dụng bộ lọc
      populateTable(filteredData, currentPage, pageSize); // Cập nhật bảng ngay lập tức
      updateSummary(); // Cập nhật tổng số liệu
    });
  } else {
    console.warn(
      "Không tìm thấy nút Áp dụng bộ lọc với class .btn-apply-filter"
    );
  }

  // Sự kiện form "Người nộp/nhận"
  if (titleBar && formContent && arrowIcon) {
    titleBar.addEventListener("click", () => {
      formContent.classList.toggle("hidden");
      arrowIcon.classList.toggle("fa-angle-up");
      arrowIcon.classList.toggle("fa-angle-down");
    });
  }
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "").slice(0, 10);
    });
  }

  // --- Note 11: Khởi tạo DateRangePicker ---
  $(document).ready(function () {
    // Khởi tạo date range picker
    $("#date-range").daterangepicker({
      startDate: moment("01/04/2025", "DD/MM/YYYY"),
      endDate: moment("09/04/2025", "DD/MM/YYYY"),
      opens: "left",
      locale: {
        format: "DD/MM/YYYY",
        separator: " - ",
        applyLabel: "Xác nhận",
        cancelLabel: "Hủy",
        fromLabel: "Từ",
        toLabel: "Đến",
        daysOfWeek: ["CN", "H", "B", "T", "N", "S", "B"],
        monthNames: [
          "Tháng Một",
          "Tháng Hai",
          "Tháng Ba",
          "Tháng Tư",
          "Tháng Năm",
          "Tháng Sáu",
          "Tháng Bảy",
          "Tháng Tám",
          "Tháng Chín",
          "Tháng Mười",
          "Tháng Mười Một",
          "Tháng Mười Hai",
        ],
        firstDay: 1,
      },
      ranges: {
        "Hôm nay": [moment(), moment()],
        "Hôm qua": [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "7 ngày trước": [moment().subtract(6, "days"), moment()],
        "Tháng này": [moment().startOf("month"), moment().endOf("month")],
        "Tháng trước": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
      alwaysShowCalendars: true,
      linkedCalendars: false,
    });

    // Thêm CSS tùy chỉnh để override các styles mặc định
    // Thực hiện ngay sau khi khởi tạo để đảm bảo các styles mới có hiệu lực
    $("<style>")
      .prop("type", "text/css")
      .html(
        `
        /* CSS đã điều chỉnh cho DateRangePicker */
        .daterangepicker {
          font-size: 14px !important;
          line-height: 1.2 !important;
          border: 1px solid #ddd !important;
          max-width: 490px !important;
          width: 490px !important;
          padding: 0 !important;
          margin-top: 5px !important;
          margin-left: 20px !important;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1) !important;
        }
  
        .daterangepicker .ranges {
          width: 120px !important;
          padding: 0 !important;
          margin: 0 !important;
          float: left !important;
          border-right: 1px solid #ddd !important;
        }
  
        .daterangepicker .ranges ul {
          list-style: none !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
  
        .daterangepicker .ranges li {
          font-size: 12px !important;
          padding: 8px 12px !important;
          margin: 0 !important;
          cursor: pointer !important;
          color: #333 !important;
          border-bottom: 1px solid #eee !important;
        }
  
        .daterangepicker .ranges li:hover {
          background-color: #2196F3 !important;
          color: white !important;
        }
  
        .daterangepicker .ranges li.active {
          background-color: #2196F3 !important;
          color: white !important;
        }
  
        .daterangepicker .drp-calendar {
          width: 170px !important;
          max-width: 170px !important;
          padding: 5px !important;
        }

        .daterangepicker .drp-calendar.left {
        margin-right: 15px !important;
      }
  
        .daterangepicker .calendar-table .month {
          font-size: 13px !important;
          font-weight: bold !important;
          text-align: center !important;
          padding: 5px 0 !important;
        }
  
        .daterangepicker th {
          font-size: 11px !important;
          font-weight: normal !important;
          padding: 3px 5px !important;
          min-width: auto !important;
          text-align: center !important;
        }
  
        .daterangepicker td {
          width: 24px !important;
          height: 24px !important;
          padding: 0 !important;
          text-align: center !important;
          font-size: 11px !important;
          line-height: 24px !important;
          min-width: 24px !important;
        }
  
        .daterangepicker .prev,
        .daterangepicker .next {
          font-size: 16px !important;
          padding: 0 !important;
          cursor: pointer !important;
        }
  
        .daterangepicker td.active,
        .daterangepicker td.active:hover {
          background-color: #2196F3 !important;
          color: white !important;
        }
  
        .daterangepicker td.in-range {
          background-color: #e3f2fd !important;
          color: #333 !important;
        }
  
        .daterangepicker td.today {
          background-color: #f0f0f0 !important;
          font-weight: bold !important;
        }
  
        .daterangepicker td.off,
        .daterangepicker td.off.in-range,
        .daterangepicker td.off.start-date,
        .daterangepicker td.off.end-date {
          background-color: #fff !important;
          color: #ccc !important;
        }
  
        .daterangepicker .drp-buttons {
          padding: 8px !important;
          border-top: 1px solid #ddd !important;
          clear: both !important;
          text-align: right !important;
        }
  
        .daterangepicker .drp-buttons .btn {
          margin-left: 8px !important;
          font-size: 12px !important;
          padding: 4px 12px !important;
        }
  
        .daterangepicker .drp-buttons .btn-primary {
          background-color: #2196F3 !important;
          color: white !important;
          border: none !important;
        }
  
        .daterangepicker .drp-buttons .cancelBtn {
          background-color: #f5f5f5 !important;
          color: #333 !important;
          border: 1px solid #ddd !important;
        }
  
        .daterangepicker .drp-calendar .calendar-time,
        .daterangepicker .drp-calendar .daterangepicker_input {
          display: none !important;
        }
  
        @media (max-width: 500px) {
          .daterangepicker {
            width: 300px !important;
            max-width: 100% !important;
          }
          
          .daterangepicker .ranges {
            width: 100% !important;
            float: none !important;
            border-right: none !important;
            border-bottom: 1px solid #ddd !important;
          }
          
          .daterangepicker .drp-calendar {
            width: 100% !important;
            max-width: none !important;
            clear: both !important;
          }
          
          .daterangepicker .drp-calendar.left {
            border-right: none !important;
            border-bottom: 1px solid #ddd !important;
          }
        }
      `
      )
      .appendTo("head");

    // Xử lý sự kiện khi chọn khoảng thời gian
    $("#date-range").on("apply.daterangepicker", function (ev, picker) {
      console.log("Ngày bắt đầu: " + picker.startDate.format("DD/MM/YYYY"));
      console.log("Ngày kết thúc: " + picker.endDate.format("DD/MM/YYYY"));

      // Cập nhật giá trị vào input
      $(this).val(
        picker.startDate.format("DD/MM/YYYY") +
          " - " +
          picker.endDate.format("DD/MM/YYYY")
      );
    });
  });
  // --- Note 12: Sự kiện tìm kiếm và phân trang ---
  populateTable(filteredData, currentPage, pageSize);
  updateSummary();

  const searchInput = document.querySelector(".search-bar input");
  const searchCriteriaSelect = document.querySelector(".search-bar select");
  if (searchInput && searchCriteriaSelect) {
    const updateFilter = () => {
      filteredData = filterData(
        searchInput.value.trim(),
        searchCriteriaSelect.value
      );
      currentPage = 1;
      populateTable(filteredData, currentPage, pageSize);
    };
    searchInput.addEventListener("input", updateFilter);
    searchCriteriaSelect.addEventListener("change", updateFilter);
  }

  const prevButton = document.querySelector(
    ".pagination-controls .btn:first-child"
  );
  const nextButton = document.querySelector(
    ".pagination-controls .btn:last-child"
  );
  const pageSizeSelector = document.querySelector(".page-size-selector select");
  if (prevButton)
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) populateTable(filteredData, --currentPage, pageSize);
    });
  if (nextButton)
    nextButton.addEventListener("click", () => {
      if (currentPage * pageSize < filteredData.length)
        populateTable(filteredData, ++currentPage, pageSize);
    });
  if (pageSizeSelector)
    pageSizeSelector.addEventListener("change", (e) => {
      pageSize = parseInt(e.target.value);
      currentPage = 1;
      populateTable(filteredData, currentPage, pageSize);
    });
}

// --- Note 13: Phiếu thu, chi và xuất file  ---

// Định nghĩa hàm hiển thị phiếu thu
function showReceiptForm() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "block";
  modal.style.position = "fixed";
  modal.style.zIndex = "1000";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.4)";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.margin = "10% auto";
  modalContent.style.padding = "20px";
  modalContent.style.border = "1px solid #888";
  modalContent.style.width = "60%";
  modalContent.style.borderRadius = "5px";

  const closeButton = document.createElement("span");
  closeButton.innerHTML = "×";
  closeButton.style.color = "#aaa";
  closeButton.style.float = "right";
  closeButton.style.fontSize = "28px";
  closeButton.style.fontWeight = "bold";
  closeButton.style.cursor = "pointer";
  closeButton.onclick = function () {
    document.body.removeChild(modal);
  };

  const formTitle = document.createElement("h2");
  formTitle.innerText = "Phiếu Thu";
  formTitle.style.color = "green";
  formTitle.style.marginBottom = "20px";

  const form = document.createElement("form");
  form.id = "receiptForm";

  // Thêm các trường thông tin cho phiếu thu
  form.innerHTML = `
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="receiptNumber" style="display: block; margin-bottom: 5px;">Số phiếu thu:</label>
      <input type="text" id="receiptNumber" name="receiptNumber" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="receiptDate" style="display: block; margin-bottom: 5px;">Ngày thu:</label>
      <input type="date" id="receiptDate" name="receiptDate" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="receiptFrom" style="display: block; margin-bottom: 5px;">Người nộp tiền:</label>
      <input type="text" id="receiptFrom" name="receiptFrom" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="receiptReason" style="display: block; margin-bottom: 5px;">Lý do:</label>
      <textarea id="receiptReason" name="receiptReason" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
    </div>
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="receiptAmount" style="display: block; margin-bottom: 5px;">Số tiền:</label>
      <input type="number" id="receiptAmount" name="receiptAmount" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div class="form-actions" style="text-align: right; margin-top: 20px;">
      <button type="button" id="cancelReceipt" style="padding: 8px 15px; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px;">Hủy</button>
      <button type="submit" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px;">Lưu</button>
    </div>
  `;

  // Xử lý sự kiện submit form
  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const receiptData = {
      type: "receipt",
      number: formData.get("receiptNumber"),
      date: formData.get("receiptDate"),
      from: formData.get("receiptFrom"),
      reason: formData.get("receiptReason"),
      amount: formData.get("receiptAmount"),
    };

    // Lưu dữ liệu vào localStorage
    saveTransaction(receiptData);

    // Đóng modal
    document.body.removeChild(modal);

    // Hiển thị thông báo
    alert("Phiếu thu đã được lưu!");
  };

  // Xử lý nút hủy
  form.querySelector("#cancelReceipt").onclick = function () {
    document.body.removeChild(modal);
  };

  modalContent.appendChild(closeButton);
  modalContent.appendChild(formTitle);
  modalContent.appendChild(form);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Định nghĩa hàm hiển thị phiếu chi
function showPaymentForm() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "block";
  modal.style.position = "fixed";
  modal.style.zIndex = "1000";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.4)";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.margin = "10% auto";
  modalContent.style.padding = "20px";
  modalContent.style.border = "1px solid #888";
  modalContent.style.width = "60%";
  modalContent.style.borderRadius = "5px";

  const closeButton = document.createElement("span");
  closeButton.innerHTML = "×";
  closeButton.style.color = "#aaa";
  closeButton.style.float = "right";
  closeButton.style.fontSize = "28px";
  closeButton.style.fontWeight = "bold";
  closeButton.style.cursor = "pointer";
  closeButton.onclick = function () {
    document.body.removeChild(modal);
  };

  const formTitle = document.createElement("h2");
  formTitle.innerText = "Phiếu Chi";
  formTitle.style.color = "red";
  formTitle.style.marginBottom = "20px";

  const form = document.createElement("form");
  form.id = "paymentForm";

  // Thêm các trường thông tin cho phiếu chi
  form.innerHTML = `
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="paymentNumber" style="display: block; margin-bottom: 5px;">Số phiếu chi:</label>
      <input type="text" id="paymentNumber" name="paymentNumber" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="paymentDate" style="display: block; margin-bottom: 5px;">Ngày chi:</label>
      <input type="date" id="paymentDate" name="paymentDate" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="paymentTo" style="display: block; margin-bottom: 5px;">Người nhận tiền:</label>
      <input type="text" id="paymentTo" name="paymentTo" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="paymentReason" style="display: block; margin-bottom: 5px;">Lý do:</label>
      <textarea id="paymentReason" name="paymentReason" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
    </div>
    <div class="form-group" style="margin-bottom: 15px;">
      <label for="paymentAmount" style="display: block; margin-bottom: 5px;">Số tiền:</label>
      <input type="number" id="paymentAmount" name="paymentAmount" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    <div class="form-actions" style="text-align: right; margin-top: 20px;">
      <button type="button" id="cancelPayment" style="padding: 8px 15px; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px;">Hủy</button>
      <button type="submit" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px;">Lưu</button>
    </div>
  `;

  // Xử lý sự kiện submit form
  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const paymentData = {
      type: "payment",
      number: formData.get("paymentNumber"),
      date: formData.get("paymentDate"),
      to: formData.get("paymentTo"),
      reason: formData.get("paymentReason"),
      amount: formData.get("paymentAmount"),
    };

    // Lưu dữ liệu vào localStorage
    saveTransaction(paymentData);

    // Đóng modal
    document.body.removeChild(modal);

    // Hiển thị thông báo
    alert("Phiếu chi đã được lưu!");
  };

  // Xử lý nút hủy
  form.querySelector("#cancelPayment").onclick = function () {
    document.body.removeChild(modal);
  };

  modalContent.appendChild(closeButton);
  modalContent.appendChild(formTitle);
  modalContent.appendChild(form);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Lưu giao dịch vào localStorage
function saveTransaction(transaction) {
  let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Hàm xuất file
function exportToFile() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

  if (transactions.length === 0) {
    alert("Không có dữ liệu để xuất file!");
    return;
  }

  // Tạo modal chọn định dạng xuất file
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "block";
  modal.style.position = "fixed";
  modal.style.zIndex = "1000";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.4)";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.margin = "15% auto";
  modalContent.style.padding = "20px";
  modalContent.style.border = "1px solid #888";
  modalContent.style.width = "40%";
  modalContent.style.borderRadius = "5px";

  const closeButton = document.createElement("span");
  closeButton.innerHTML = "×";
  closeButton.style.color = "#aaa";
  closeButton.style.float = "right";
  closeButton.style.fontSize = "28px";
  closeButton.style.fontWeight = "bold";
  closeButton.style.cursor = "pointer";
  closeButton.onclick = function () {
    document.body.removeChild(modal);
  };

  const title = document.createElement("h3");
  title.innerText = "Chọn định dạng xuất file";
  title.style.marginBottom = "20px";

  const exportOptions = document.createElement("div");
  exportOptions.style.display = "flex";
  exportOptions.style.flexDirection = "column";
  exportOptions.style.gap = "10px";

  const exportAsCSV = document.createElement("button");
  exportAsCSV.innerText = "Xuất file CSV";
  exportAsCSV.style.padding = "10px";
  exportAsCSV.style.backgroundColor = "#007bff";
  exportAsCSV.style.color = "white";
  exportAsCSV.style.border = "none";
  exportAsCSV.style.borderRadius = "4px";
  exportAsCSV.style.cursor = "pointer";
  exportAsCSV.onclick = function () {
    exportCSV(transactions);
    document.body.removeChild(modal);
  };

  const exportAsJSON = document.createElement("button");
  exportAsJSON.innerText = "Xuất file JSON";
  exportAsJSON.style.padding = "10px";
  exportAsJSON.style.backgroundColor = "#28a745";
  exportAsJSON.style.color = "white";
  exportAsJSON.style.border = "none";
  exportAsJSON.style.borderRadius = "4px";
  exportAsJSON.style.cursor = "pointer";
  exportAsJSON.onclick = function () {
    exportJSON(transactions);
    document.body.removeChild(modal);
  };

  const exportAsTXT = document.createElement("button");
  exportAsTXT.innerText = "Xuất file TXT";
  exportAsTXT.style.padding = "10px";
  exportAsTXT.style.backgroundColor = "#6c757d";
  exportAsTXT.style.color = "white";
  exportAsTXT.style.border = "none";
  exportAsTXT.style.borderRadius = "4px";
  exportAsTXT.style.cursor = "pointer";
  exportAsTXT.onclick = function () {
    exportTXT(transactions);
    document.body.removeChild(modal);
  };

  exportOptions.appendChild(exportAsCSV);
  exportOptions.appendChild(exportAsJSON);
  exportOptions.appendChild(exportAsTXT);

  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(exportOptions);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Xuất file CSV
function exportCSV(transactions) {
  let csvContent = "Loại,Số phiếu,Ngày,Người nộp/nhận,Lý do,Số tiền\n";

  transactions.forEach((transaction) => {
    const type = transaction.type === "receipt" ? "Phiếu thu" : "Phiếu chi";
    const person =
      transaction.type === "receipt" ? transaction.from : transaction.to;
    csvContent += `${type},${transaction.number},${transaction.date},${person},"${transaction.reason}",${transaction.amount}\n`;
  });

  downloadFile(csvContent, "phieu-thu-chi.csv", "text/csv");
}

// Xuất file JSON
function exportJSON(transactions) {
  const jsonContent = JSON.stringify(transactions, null, 2);
  downloadFile(jsonContent, "phieu-thu-chi.json", "application/json");
}

// Xuất file TXT
function exportTXT(transactions) {
  let txtContent = "BÁO CÁO PHIẾU THU CHI\n";
  txtContent += "======================\n\n";

  let totalReceipt = 0;
  let totalPayment = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "receipt") {
      txtContent += `PHIẾU THU #${transaction.number}\n`;
      txtContent += `Ngày: ${transaction.date}\n`;
      txtContent += `Người nộp: ${transaction.from}\n`;
      txtContent += `Lý do: ${transaction.reason}\n`;
      txtContent += `Số tiền: ${transaction.amount} VND\n\n`;
      totalReceipt += parseFloat(transaction.amount);
    } else {
      txtContent += `PHIẾU CHI #${transaction.number}\n`;
      txtContent += `Ngày: ${transaction.date}\n`;
      txtContent += `Người nhận: ${transaction.to}\n`;
      txtContent += `Lý do: ${transaction.reason}\n`;
      txtContent += `Số tiền: ${transaction.amount} VND\n\n`;
      totalPayment += parseFloat(transaction.amount);
    }
  });

  txtContent += "======================\n";
  txtContent += `Tổng thu: ${totalReceipt} VND\n`;
  txtContent += `Tổng chi: ${totalPayment} VND\n`;
  txtContent += `Số dư: ${totalReceipt - totalPayment} VND\n`;

  downloadFile(txtContent, "phieu-thu-chi.txt", "text/plain");
}

// Hàm tải file
function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Gắn sự kiện cho các nút
document.addEventListener("DOMContentLoaded", function () {
  // Nút Phiếu thu
  document
    .querySelector("button.btn-success:nth-child(1)")
    .addEventListener("click", showReceiptForm);

  // Nút Phiếu chi
  document
    .querySelector("button.btn-success:nth-child(2)")
    .addEventListener("click", showPaymentForm);

  // Nút Xuất file
  document
    .querySelector("button.btn-light:nth-child(3)")
    .addEventListener("click", exportToFile);
});

// Note: Sửa đoạn code xử lý dropdown để tránh xung đột
document.addEventListener("DOMContentLoaded", function () {
  // Xử lý dropdown cho ngân hàng
  const bankDropdownToggle = document.getElementById("bank-dropdown-toggle");
  const bankDropdownMenu = document.getElementById("bank-dropdown-menu");
  const selectedBankAccount = document.getElementById("selected-bank-account");
  const bankFilterItems =
    bankDropdownMenu?.getElementsByClassName("filter-item");

  if (
    bankDropdownToggle &&
    bankDropdownMenu &&
    selectedBankAccount &&
    bankFilterItems
  ) {
    bankDropdownToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      bankDropdownMenu.style.display =
        bankDropdownMenu.style.display === "block" ? "none" : "block";
    });

    Array.from(bankFilterItems).forEach((item) => {
      item.addEventListener("click", function () {
        const value = this.getAttribute("data-value");
        const text = this.textContent;
        selectedBankAccount.textContent = text;
        selectedBankAccount.setAttribute("data-value", value);
        bankDropdownMenu.style.display = "none";
        applyFilters();
      });
    });
  }

  // Xử lý dropdown cho trạng thái
  const statusFilter = document.getElementById("status-filter");
  const statusDropdownToggle = statusFilter?.querySelector(
    ".custom-filter-selected"
  );
  const statusDropdownMenu = statusFilter?.querySelector(
    ".custom-filter-dropdown"
  );
  const selectedStatus = document.getElementById("selected-status");
  const statusFilterItems =
    statusDropdownMenu?.getElementsByClassName("filter-item");
  const clearStatusBtn = document.getElementById("clear-status");

  if (
    statusDropdownToggle &&
    statusDropdownMenu &&
    selectedStatus &&
    statusFilterItems
  ) {
    statusDropdownToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      statusDropdownMenu.style.display =
        statusDropdownMenu.style.display === "block" ? "none" : "block";
    });

    Array.from(statusFilterItems).forEach((item) => {
      item.addEventListener("click", function () {
        const value = this.getAttribute("data-value");
        const text = this.textContent;
        selectedStatus.textContent = text;
        selectedStatus.setAttribute("data-value", value);
        statusDropdownMenu.style.display = "none";
        applyFilters();
      });
    });

    // Xử lý nút clear cho trạng thái
    clearStatusBtn?.addEventListener("click", function (e) {
      e.stopPropagation();
      selectedStatus.textContent = "Tất cả";
      selectedStatus.setAttribute("data-value", "all");
      applyFilters();
    });
  }

  // Đóng dropdown khi click ra ngoài
  document.addEventListener("click", function (e) {
    if (bankDropdownToggle && !bankDropdownToggle.contains(e.target)) {
      bankDropdownMenu.style.display = "none";
    }
    if (statusDropdownToggle && !statusDropdownToggle.contains(e.target)) {
      statusDropdownMenu.style.display = "none";
    }
  });
});

// --- Note 14: Gọi hàm chính khi DOM sẵn sàng ---
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupDepositorRecipientDropdown();
});

// --- Note 15: Thêm hàm áp dụng bộ lọc ---
function applyFilters() {
  const personType =
    document.getElementById("selected-person")?.textContent || "Tất cả";
  const personName =
    document.getElementById("depositor-name")?.value.trim().toLowerCase() || "";
  const documentType =
    document.querySelector("#chon-1 button.active")?.dataset.type || "all";
  const status =
    document.getElementById("selected-status")?.textContent || "Tất cả";
  const bankAccount =
    document.getElementById("selected-bank-account")?.textContent ||
    "Chọn ngân hàng";
  const categoryFilter =
    document.getElementById("selected-category")?.textContent || "Tất cả"; // Lấy giá trị từ dropdown Loại thu chi

  filteredData = transactions.filter((item) => {
    // Lọc theo loại chứng từ
    let matchesDocumentType = true;
    if (documentType === "phieuThu") {
      matchesDocumentType = item.maPhieu.startsWith("PT");
    } else if (documentType === "phieuChi") {
      matchesDocumentType = item.maPhieu.startsWith("PC");
    }

    // Lọc theo trạng thái
    let matchesStatus = true;
    if (status !== "Tất cả") {
      matchesStatus = item.trangThai === status;
    }

    // Lọc theo tài khoản ngân hàng
    let matchesBankAccount = true;
    if (bankAccount !== "Chọn ngân hàng") {
      matchesBankAccount = item.taiKhoanNganHang === bankAccount;
    }

    // Lọc theo loại người nộp/nhận (Nhân viên, Khách hàng, Nhà cung cấp, v.v.)
    let matchesPersonType = true;
    if (personType !== "Tất cả") {
      const personTypeValue =
        personType === "Nhân viên"
          ? "employee"
          : personType === "Khách hàng"
          ? "customer"
          : personType === "Nhà cung cấp"
          ? "supplier"
          : personType === "Khác"
          ? "other"
          : "all";
      matchesPersonType = item.personType === personTypeValue;
    }

    // Lọc theo tên người nộp/nhận
    let matchesPersonName = true;
    if (personName) {
      matchesPersonName = item.nguoiNopNhan.toLowerCase().includes(personName);
    }

    // Lọc theo loại thu chi
    let matchesCategory = true;
    if (categoryFilter !== "Tất cả") {
      matchesCategory = item.loaiThuChi === categoryFilter;
    }

    return (
      matchesDocumentType &&
      matchesStatus &&
      matchesBankAccount &&
      matchesPersonType &&
      matchesPersonName &&
      matchesCategory // Thêm điều kiện lọc theo Loại thu chi
    );
  });

  currentPage = 1; // Reset về trang đầu tiên sau khi lọc
}
// Note 17: Hàm xử lý dropdown "Người nộp/nhận" (được điều chỉnh cho HTML đã cung cấp)
function setupDepositorRecipientDropdown() {
  const depositorRecipientToggle = document.querySelector(".selected-option");
  const depositorRecipientDropdown =
    document.querySelector(".dropdown-options");
  const depositorRecipientItems = document.querySelectorAll(".dropdown-option");
  const selectedDepositorRecipient = document.getElementById("selected-person");

  if (
    depositorRecipientToggle &&
    depositorRecipientDropdown &&
    selectedDepositorRecipient
  ) {
    // Mở/đóng dropdown khi click vào toggle
    depositorRecipientToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      depositorRecipientDropdown.classList.toggle("show");
    });

    // Xử lý khi chọn một item
    depositorRecipientItems.forEach((item) => {
      item.addEventListener("click", () => {
        selectedDepositorRecipient.textContent = item.textContent;
        selectedDepositorRecipient.setAttribute(
          "data-value",
          item.getAttribute("data-value")
        );
        depositorRecipientDropdown.classList.remove("show");

        // Cập nhật giá trị input "Nhập họ tên" nếu cần (ví dụ: xóa giá trị khi chọn "Tất cả")
        const nameInput = document.getElementById("depositor-name");
        if (nameInput && item.getAttribute("data-value") === "all") {
          nameInput.value = "";
        }

        applyFilters(); // Gọi hàm applyFilters để lọc dữ liệu
      });
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (
        !depositorRecipientToggle.contains(e.target) &&
        !depositorRecipientDropdown.contains(e.target)
      ) {
        depositorRecipientDropdown.classList.remove("show");
      }
    });
  }

  // Xử lý input số điện thoại (giới hạn chỉ nhập số và tối đa 10 ký tự)
  const phoneInput = document.getElementById("depositor-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "").slice(0, 10);
    });
  }

  // Xử lý input "Nhập họ tên" để lọc dữ liệu khi người dùng nhập
  const nameInput = document.getElementById("depositor-name");
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      applyFilters(); // Gọi applyFilters để lọc dữ liệu theo tên
    });
  }
}
