let financialChart = null;

// Populate Stats Cards
async function populateStatsCards() {
  const statsContainer = document.getElementById("statsContainer");
  if (!statsContainer) return;
  statsContainer.innerHTML = "";

  try {
    // Lấy tổng sản phẩm trong kho
    const productsResponse = await fetch('http://localhost:5000/api/products');
    const productsData = await productsResponse.json();
    let totalProducts = productsData.reduce((sum, p) => sum + (p.stock || 0), 0);

    // Lấy tổng khách hàng
    const customersResponse = await fetch('http://localhost:5000/api/customers');
    const customers = await customersResponse.json();
    let totalCustomers = customers.length;

    // Lấy tổng nhân viên đang làm
    const employeesResponse = await fetch('http://localhost:5000/api/employees/all');
    const employees = await employeesResponse.json();
    let totalActiveEmployees = employees.filter(e => e.status === "Đang làm").length;

    // Tạo mảng thống kê động
    const stats = [
      {
        icon: "fa-mobile-screen",
        iconClass: "product-icon",
        value: totalProducts,
        label: "Sản phẩm hiện có trong kho",
      },
      {
        icon: "fa-user-tie",
        iconClass: "customer-icon",
        value: totalCustomers,
        label: "Khách từ trước đến nay",
      },
      {
        icon: "fa-user",
        iconClass: "staff-icon",
        value: totalActiveEmployees,
        label: "Nhân viên đang hoạt động",
      },
    ];

    stats.forEach((stat) => {
      const statCard = document.createElement("div");
      statCard.className = "stat-card";
      statCard.innerHTML = `
          <div class="stat-icon ${stat.iconClass}">
            <i class="fa-solid ${stat.icon}"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
          </div>
        `;
      statsContainer.appendChild(statCard);
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu thống kê:", error);
  }
}

// Function to calculate monthly data from invoices and purchases
async function calculateMonthlyData() {
  try {
    const invoicesResponse = await fetch('http://localhost:5000/api/invoices');
    const invoices = await invoicesResponse.json();
    
    const importsResponse = await fetch('http://localhost:5000/api/imports');
    const imports = await importsResponse.json();
    
    const monthlyData = new Map();

    // Process invoices (revenue)
    invoices.forEach(invoice => {
      const date = new Date(invoice.time);
      if (isNaN(date)) return;
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { date: monthKey, capital: 0, revenue: 0, profit: 0 });
      }
      monthlyData.get(monthKey).revenue += invoice.totalAmount || 0;
    });

    // Process imports (capital)
    imports.data.forEach(import_ => {
      const date = new Date(import_.time);
      if (isNaN(date)) return;
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { date: monthKey, capital: 0, revenue: 0, profit: 0 });
      }
      monthlyData.get(monthKey).capital += import_.paidAmount || 0;
    });

    // Calculate profit
    monthlyData.forEach(data => {
      data.profit = data.revenue - data.capital;
    });

    // Return sorted array
    return Array.from(monthlyData.values()).sort((a, b) => {
      const [aMonth, aYear] = a.date.split('/');
      const [bMonth, bYear] = b.date.split('/');
      return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
    });
  } catch (error) {
    console.error("Error calculating monthly data:", error);
    return [];
  }
}

// Function to calculate yearly data from invoices and purchases
async function calculateYearlyData() {
  try {
    const invoicesResponse = await fetch('http://localhost:5000/api/invoices');
    const invoices = await invoicesResponse.json();
    
    const importsResponse = await fetch('http://localhost:5000/api/imports');
    const imports = await importsResponse.json();
    
    const yearlyData = new Map();

    // Aggregate revenue by year
    invoices.forEach(invoice => {
      const date = new Date(invoice.time);
      if (isNaN(date)) return;
      const year = date.getFullYear();
      if (!yearlyData.has(year)) {
        yearlyData.set(year, { 
          year, 
          capital: 0, 
          revenue: 0, 
          profit: 0,
          formattedYear: year.toString()
        });
      }
      yearlyData.get(year).revenue += parseFloat(invoice.totalAmount) || 0;
    });

    // Aggregate capital by year
    imports.data.forEach(import_ => {
      const date = new Date(import_.time);
      if (isNaN(date)) return;
      const year = date.getFullYear();
      if (!yearlyData.has(year)) {
        yearlyData.set(year, { 
          year, 
          capital: 0, 
          revenue: 0, 
          profit: 0,
          formattedYear: year.toString()
        });
      }
      yearlyData.get(year).capital += parseFloat(import_.paidAmount) || 0;
    });

    // Calculate profit and format numbers
    yearlyData.forEach(data => {
      data.profit = data.revenue - data.capital;
      // Format numbers to 2 decimal places
      data.capital = parseFloat(data.capital.toFixed(2));
      data.revenue = parseFloat(data.revenue.toFixed(2));
      data.profit = parseFloat(data.profit.toFixed(2));
    });

    // Return sorted array by year
    return Array.from(yearlyData.values()).sort((a, b) => a.year - b.year);
  } catch (error) {
    console.error("Error calculating yearly data:", error);
    return [];
  }
}

// Function to calculate monthly data for a specific year
async function calculateMonthlyDataForYear(year) {
  try {
    const invoicesResponse = await fetch('http://localhost:5000/api/invoices');
    const invoices = await invoicesResponse.json();
    
    const importsResponse = await fetch('http://localhost:5000/api/imports');
    const imports = await importsResponse.json();
    
    // Initialize array for 12 months
    const result = [];
    for (let month = 1; month <= 12; month++) {
      result.push({
        month: month,
        year: year,
        capital: 0,
        revenue: 0,
        profit: 0
      });
    }

    // Aggregate revenue by month
    invoices.forEach(invoice => {
      const date = new Date(invoice.time);
      if (isNaN(date)) return;
      if (date.getFullYear() === year) {
        const monthIndex = date.getMonth(); // 0-based
        result[monthIndex].revenue += invoice.totalAmount || 0;
      }
    });

    // Aggregate capital by month
    imports.data.forEach(import_ => {
      const date = new Date(import_.time);
      if (isNaN(date)) return;
      if (date.getFullYear() === year) {
        const monthIndex = date.getMonth(); // 0-based
        result[monthIndex].capital += import_.paidAmount || 0;
      }
    });

    // Calculate profit
    result.forEach(item => {
      item.profit = item.revenue - item.capital;
    });

    return result;
  } catch (error) {
    console.error("Error calculating monthly data for year:", error);
    return [];
  }
}

// Function to update financial data based on mode (year/month)
async function updateFinancialDataByMode(mode) {
  let data = [];
  if (mode === 'year') {
    data = await calculateYearlyData();
  } else if (mode === 'month') {
    data = await calculateMonthlyData();
  }
  await initializeFinancialChart(data);
  populateFinancialTable(data);
}

// Function to update financial data for a specific range
async function updateFinancialDataForRange(from, to, mode = "year") {
  if (!from || (mode === "year" && to && from > to)) {
    alert("Vui lòng nhập khoảng thời gian hợp lệ!");
    return;
  }

  let filteredData = [];
  if (mode === "month") {
    const year = parseInt(from);
    if (isNaN(year) || year < 1900 || year > 2100) {
      alert("Vui lòng nhập năm hợp lệ!");
      return;
    }

    // Get monthly data for the specified year
    filteredData = await calculateMonthlyDataForYear(year);

    // Check if there's any data
    const hasData = filteredData.some(item => item.capital > 0 || item.revenue > 0 || item.profit !== 0);
    if (!hasData) {
      alert("Không có dữ liệu để hiển thị cho năm " + year);
      return;
    }

    // Update chart and table
    await initializeFinancialChart(filteredData);
    renderMonthlyTable(filteredData);
    alert(`Thống kê từng tháng trong năm ${year}`);
  } else if (mode === "year") {
    const fromYear = parseInt(from);
    const toYear = parseInt(to);
    const yearlyData = await calculateYearlyData();
    filteredData = yearlyData.filter(item => item.year >= fromYear && item.year <= toYear);

    if (filteredData.length === 0) {
      alert("Không có dữ liệu để hiển thị từ năm " + from + " đến năm " + to);
      return;
    }
    await initializeFinancialChart(filteredData);
    populateFinancialTable(filteredData);
    alert(`Thống kê từ năm ${from} đến năm ${to}`);
    return;
  }
}

// Function to render monthly table
function renderMonthlyTable(data) {
  updateFinancialTableHeader(true);
  const tbody = document.getElementById("financialTable").getElementsByTagName("tbody")[0];
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                     'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  
  data.forEach(item => {
    const row = document.createElement("tr");
    const monthName = monthNames[item.month - 1];
    row.innerHTML = `
      <td>${monthName}/${item.year}</td>
      <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.capital)}</td>
      <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}</td>
      <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.profit)}</td>
    `;
    tbody.appendChild(row);
  });
}

// Function to update financial table header
function updateFinancialTableHeader(isMonth) {
  const table = document.getElementById("financialTable");
  if (!table) return;
  const th = table.querySelector("thead tr th:first-child");
  if (th) th.textContent = isMonth ? "Tháng/Năm" : "Năm";
}

// Function to populate financial table
function populateFinancialTable(data) {
  updateFinancialTableHeader(false);
  const tbody = document.getElementById("financialTable").getElementsByTagName("tbody")[0];
  if (!tbody) return;
  tbody.innerHTML = "";
  
  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.formattedYear || item.year}</td>
      <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.capital)}</td>
      <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}</td>
      <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.profit)}</td>
    `;
    tbody.appendChild(row);
  });
}

// Update Revenue Chart
async function initializeRevenueChart() {
  const revenueChartCanvas = document.getElementById("revenueChart");
  if (!revenueChartCanvas) return;
  
  const ctx = revenueChartCanvas.getContext("2d");
  const monthlyData = await calculateMonthlyData();
  
  const labels = monthlyData.map(item => item.date);
  const capitalData = monthlyData.map(item => item.capital);
  const revenueValues = monthlyData.map(item => item.revenue);
  const profitData = monthlyData.map(item => item.profit);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Vốn",
          data: capitalData,
          borderColor: "#1A73E8",
          backgroundColor: "rgba(26, 115, 232, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Doanh thu",
          data: revenueValues,
          borderColor: "#673AB7",
          backgroundColor: "rgba(103, 58, 183, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Lợi nhuận",
          data: profitData,
          borderColor: "#F6511D",
          backgroundColor: "rgba(246, 81, 29, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, padding: 15, font: { size: 12 } },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value / 1000000 + "M";
            },
            font: { size: 10 },
          },
        },
      },
    },
  });
}

// Update Revenue Table
async function populateRevenueTable() {
  const tableBody = document.getElementById("revenueTableBody");
  if (!tableBody) return;
  
  tableBody.innerHTML = "";
  const monthlyData = await calculateMonthlyData();
  
  monthlyData.forEach((item) => {
    const row = document.createElement("tr");
    const formattedCapital = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    })
      .format(item.capital)
      .replace("₫", "đ");
    const formattedRevenue = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    })
      .format(item.revenue)
      .replace("₫", "đ");
    const formattedProfit = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    })
      .format(item.profit)
      .replace("₫", "đ");
    row.innerHTML = `
        <td>${item.date}</td>
        <td>${formattedCapital}</td>
        <td>${formattedRevenue}</td>
        <td>${formattedProfit}</td>
      `;
    tableBody.appendChild(row);
  });
}

// Initialize Financial Chart
async function initializeFinancialChart(data) {
  const financialChartCanvas = document.getElementById("financialChart");
  if (!financialChartCanvas) return;
  const ctx = financialChartCanvas.getContext("2d");

  // Destroy old chart if exists
  if (financialChart && typeof financialChart.destroy === 'function') {
    financialChart.destroy();
  }

  // Check if data is monthly or yearly
  const isMonthly = data.length > 0 && 'month' in data[0];
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                     'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  financialChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((item) => isMonthly ? monthNames[item.month - 1] : (item.formattedYear || item.year)),
      datasets: [
        {
          label: "Vốn",
          data: data.map((item) => item.capital),
          backgroundColor: "rgba(255, 152, 0, 0.7)",
          borderColor: "rgb(255, 152, 0)",
          borderWidth: 1
        },
        {
          label: "Doanh thu",
          data: data.map((item) => item.revenue),
          backgroundColor: "rgba(33, 150, 243, 0.7)",
          borderColor: "rgb(33, 150, 243)",
          borderWidth: 1
        },
        {
          label: "Lợi nhuận",
          data: data.map((item) => item.profit),
          backgroundColor: "rgba(156, 39, 176, 0.7)",
          borderColor: "rgb(156, 39, 176)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: { 
          position: "bottom",
          labels: {
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        },
        title: {
          display: true,
          text: isMonthly ? `Thống kê theo tháng năm ${data[0].year}` : 'Thống kê theo năm',
          font: {
            size: 16
          }
        }
      },
      scales: {
        x: { 
          grid: { display: false },
          ticks: {
            font: { size: 12 }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
              }).format(value);
            },
            font: { size: 12 }
          }
        }
      }
    }
  });
}

// Populate Customer Table
function populateCustomerTable(data) {
  const tableBody = document
    .getElementById("customerTable")
    ?.getElementsByTagName("tbody")[0];
  if (!tableBody) return;
  tableBody.innerHTML = "";
  data.forEach((item) => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = item.name;
    row.insertCell(1).textContent = item.date;
    row.insertCell(2).textContent = item.orders;
    row.insertCell(3).textContent = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    })
      .format(item.totalSpent)
      .replace("₫", "đ");
  });
}

// Tab Switching Logic
function initializeTabs() {
  const tabItems = document.querySelectorAll(".tab-item");
  const overviewContent = document.getElementById("overview-content");
  const revenueContent = document.getElementById("revenue-content");
  const customerContent = document.getElementById("customer-content");

  // Check if required elements exist
  if (!overviewContent || !revenueContent) {
    console.error("Required content elements not found");
    return;
  }

  tabItems.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabItems.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      const tabId = tab.getAttribute("data-tab");
      
      // Hide all content sections first
      if (overviewContent) overviewContent.style.display = "none";
      if (revenueContent) revenueContent.style.display = "none";
      if (customerContent) customerContent.style.display = "none";

      // Show the selected content
      if (tabId === "overview" && overviewContent) {
        overviewContent.style.display = "block";
      } else if (tabId === "revenue" && revenueContent) {
        revenueContent.style.display = "block";
        const subTabs = document.querySelectorAll("#revenue-content .tab");
        if (subTabs.length > 0) {
          subTabs.forEach((item) => item.classList.remove("active"));
          subTabs[0].classList.add("active");
          updateRevenueFilterUI("year"); // Cập nhật giao diện ngay khi chuyển tab
          initializeRevenueFilter();
          updateFinancialDataByMode('year');
        }
        // Move button event listeners here
        const btnStatistic = document.getElementById("btnStatistic");
        const btnReset = document.getElementById("btnReset");
        const btnExport = document.getElementById("btnExport");

        if (btnStatistic) btnStatistic.addEventListener("click", handleRevenueStatistics);
        if (btnReset) btnReset.addEventListener("click", handleRevenueRefresh);
        if (btnExport) btnExport.addEventListener("click", exportFinancialTableToExcel);

      } else if (tabId === "customer" && customerContent) {
        customerContent.style.display = "block";
        initializeCustomerFilter();
        updateCustomerDataFromStorage();
      }
    });
  });
}

// Revenue Filter Logic
function initializeRevenueFilter() {
  const subTabs = document.querySelectorAll("#revenue-content .tab");
  const dateFilter = document.querySelector("#revenue-content .date-filter");
  const toYearInput = document.getElementById("toYear");
  const toYearLabel = document.querySelector(
    "#revenue-content .date-filter span:nth-child(3)"
  );

  subTabs.forEach((subTab) => {
    subTab.addEventListener("click", () => {
      subTabs.forEach((item) => item.classList.remove("active"));
      subTab.classList.add("active");

      const subTabId = subTab.getAttribute("data-tab");
      if (dateFilter) {
        dateFilter.style.display = "flex";
      }
      updateRevenueFilterUI(subTabId);
    });
  });
}

function updateRevenueFilterUI(mode) {
  const fromYear = document.getElementById("fromYear");
  const toYear = document.getElementById("toYear");
  const toYearLabel = document.querySelector(
    "#revenue-content .date-filter span:nth-child(3)"
  );

  if (mode === "year") {
    fromYear.placeholder = "Từ năm";
    toYear.style.display = "inline-block";
    toYearLabel.style.display = "inline";
    toYear.placeholder = "Đến năm";
  } else if (mode === "month") {
    fromYear.placeholder = "Nhập năm";
    toYear.style.display = "none";
    toYearLabel.style.display = "none";
  } else if (mode === "day") {
    fromYear.placeholder = "Từ ngày";
    toYear.style.display = "inline-block";
    toYearLabel.style.display = "inline";
    toYear.placeholder = "Đến ngày";
  } else if (mode === "range") {
    fromYear.placeholder = "Từ ngày";
    toYear.style.display = "inline-block";
    toYearLabel.style.display = "inline";
    toYear.placeholder = "Đến ngày";
  }
  fromYear.value = "";
  toYear.value = "";
}

// Customer Filter Logic
function initializeCustomerFilter() {
  const subTabs = document.querySelectorAll("#customer-content .tab");
  const dateFilter = document.querySelector("#customer-content .date-filter");

  subTabs.forEach((subTab) => {
    subTab.addEventListener("click", () => {
      subTabs.forEach((item) => item.classList.remove("active"));
      subTab.classList.add("active");

      const subTabId = subTab.getAttribute("data-tab");
      if (dateFilter) {
        dateFilter.style.display = "flex";
      }

      if (subTabId === "year") {
        document.getElementById("customerFromYear").placeholder = "Từ năm";
        document.getElementById("customerToYear").placeholder = "Đến năm";
      } else if (subTabId === "month") {
        document.getElementById("customerFromYear").placeholder =
          "Từ tháng (VD: 2023-05)";
        document.getElementById("customerToYear").placeholder =
          "Đến tháng (VD: 2023-06)";
      } else if (subTabId === "day") {
        document.getElementById("customerFromYear").placeholder = "Từ ngày";
        document.getElementById("customerToYear").placeholder = "Đến ngày";
      } else if (subTabId === "range") {
        document.getElementById("customerFromYear").placeholder = "Từ ngày";
        document.getElementById("customerToYear").placeholder = "Đến ngày";
      }
    });
  });
}

// Update Customer Data
function updateCustomerData(data) {
  if (data && data.length > 0) {
    initializeCustomerChart(data);
    populateCustomerTable(data);
  } else {
    console.error("Dữ liệu khách hàng rỗng hoặc không hợp lệ.");
  }
}

// Handle Form Actions for Revenue
async function handleRevenueStatistics() {
  const fromYear = document.getElementById("fromYear").value;
  const toYear = document.getElementById("toYear").value;
  const activeTab = document
    .querySelector("#revenue-content .tab.active")
    ?.getAttribute("data-tab");

  if (!activeTab) {
    console.error("Không tìm thấy tab active trong #revenue-content");
    return;
  }

  if (activeTab === "month") {
    await updateFinancialDataForRange(fromYear, null, "month");
  } else if (activeTab === "year") {
    await updateFinancialDataForRange(fromYear, toYear, "year");
  }
}

async function handleRevenueRefresh() {
  const fromYearInput = document.getElementById("fromYear");
  const toYearInput = document.getElementById("toYear");
  if (fromYearInput) fromYearInput.value = "";
  if (toYearInput) toYearInput.value = "";
  await updateFinancialDataByMode('year');
  alert("Đã làm mới!");
}

// Initialize customer sample data
function initializeCustomerData() {
  const customerData = [
    { code: "KH001", name: "Nguyễn Văn A", birthdate: "1990-01-15", gender: "Nam", address: "123 Nguyễn Huệ, TP.HCM", phone: "0901234567", cardType: "Gói tập 1 tháng", startDate: "2024-01-01", endDate: "2024-12-31", status: "Đang hoạt động" },
    { code: "KH002", name: "Trần Thị B", birthdate: "1995-05-20", gender: "Nữ", address: "456 Lê Lợi, Hà Nội", phone: "0902345678", cardType: "Gói tập 3 tháng", startDate: "2024-02-01", endDate: "2024-11-30", status: "Đang hoạt động" },
    { code: "KH003", name: "Lê Văn C", birthdate: "1988-08-10", gender: "Nam", address: "789 Trần Phú, Đà Nẵng", phone: "0903456789", cardType: "Gói tập 6 tháng", startDate: "2024-03-01", endDate: "2024-12-31", status: "Đang hoạt động" },
    { code: "KH004", name: "Phạm Thị D", birthdate: "1992-12-25", gender: "Nữ", address: "321 Nguyễn Du, TP.HCM", phone: "0904567890", cardType: "Gói tập 12 tháng", startDate: "2024-01-15", endDate: "2024-10-15", status: "Đang hoạt động" },
    { code: "KH005", name: "Hoàng Văn E", birthdate: "1993-03-30", gender: "Nam", address: "654 Lý Thường Kiệt, Hà Nội", phone: "0905678901", cardType: "Gói tập 1 tháng", startDate: "2024-02-15", endDate: "2024-11-15", status: "Đang hoạt động" },
    { code: "KH006", name: "Nguyễn Thị F", birthdate: "1991-06-18", gender: "Nữ", address: "987 Điện Biên Phủ, TP.HCM", phone: "0906789012", cardType: "Gói tập 3 tháng", startDate: "2024-03-15", endDate: "2024-12-15", status: "Đang hoạt động" },
    { code: "KH007", name: "Trần Văn G", birthdate: "1994-09-05", gender: "Nam", address: "147 Nguyễn Thị Minh Khai, Hà Nội", phone: "0907890123", cardType: "Gói tập 6 tháng", startDate: "2024-01-20", endDate: "2024-10-20", status: "Đang hoạt động" },
    { code: "KH008", name: "Lê Thị H", birthdate: "1989-11-12", gender: "Nữ", address: "258 Lê Duẩn, Đà Nẵng", phone: "0908901234", cardType: "Gói tập 12 tháng", startDate: "2024-02-20", endDate: "2024-11-20", status: "Đang hoạt động" },
    { code: "KH009", name: "Phạm Văn I", birthdate: "1996-02-28", gender: "Nam", address: "369 Võ Văn Tần, TP.HCM", phone: "0909012345", cardType: "Gói tập 1 tháng", startDate: "2024-03-20", endDate: "2024-12-20", status: "Đang hoạt động" },
    { code: "KH010", name: "Hoàng Thị K", birthdate: "1990-04-15", gender: "Nữ", address: "741 Nguyễn Đình Chiểu, Hà Nội", phone: "0900123456", cardType: "Gói tập 3 tháng", startDate: "2024-01-25", endDate: "2024-10-25", status: "Đang hoạt động" },
    { code: "KH011", name: "Nguyễn Văn L", birthdate: "1993-07-22", gender: "Nam", address: "852 Trần Hưng Đạo, Đà Nẵng", phone: "0901234567", cardType: "Gói tập 6 tháng", startDate: "2024-02-25", endDate: "2024-11-25", status: "Đang hoạt động" },
    { code: "KH012", name: "Trần Thị M", birthdate: "1995-10-08", gender: "Nữ", address: "963 Lê Văn Sỹ, TP.HCM", phone: "0902345678", cardType: "Gói tập 12 tháng", startDate: "2024-03-25", endDate: "2024-12-25", status: "Đang hoạt động" },
    { code: "KH013", name: "Lê Văn N", birthdate: "1987-12-30", gender: "Nam", address: "159 Nguyễn Huệ, Hà Nội", phone: "0903456789", cardType: "Gói tập 1 tháng", startDate: "2024-01-30", endDate: "2024-10-30", status: "Đang hoạt động" },
    { code: "KH014", name: "Phạm Thị O", birthdate: "1992-03-17", gender: "Nữ", address: "357 Lê Lợi, Đà Nẵng", phone: "0904567890", cardType: "Gói tập 3 tháng", startDate: "2024-02-28", endDate: "2024-11-28", status: "Đang hoạt động" },
    { code: "KH015", name: "Hoàng Văn P", birthdate: "1994-06-24", gender: "Nam", address: "486 Trần Phú, TP.HCM", phone: "0905678901", cardType: "Gói tập 6 tháng", startDate: "2024-03-30", endDate: "2024-12-30", status: "Đang hoạt động" },
    { code: "KH016", name: "Nguyễn Thị Q", birthdate: "1991-09-11", gender: "Nữ", address: "753 Nguyễn Du, Hà Nội", phone: "0906789012", cardType: "Gói tập 12 tháng", startDate: "2024-01-05", endDate: "2024-10-05", status: "Đang hoạt động" },
    { code: "KH017", name: "Trần Văn R", birthdate: "1993-12-18", gender: "Nam", address: "852 Lý Thường Kiệt, Đà Nẵng", phone: "0907890123", cardType: "Gói PT 1 tháng", startDate: "2024-02-05", endDate: "2024-11-05", status: "Đang hoạt động" },
    { code: "KH018", name: "Lê Thị S", birthdate: "1996-02-25", gender: "Nữ", address: "951 Điện Biên Phủ, TP.HCM", phone: "0908901234", cardType: "Gói PT 3 tháng", startDate: "2024-03-05", endDate: "2024-12-05", status: "Đang hoạt động" },
    { code: "KH019", name: "Phạm Văn T", birthdate: "1988-05-02", gender: "Nam", address: "357 Nguyễn Thị Minh Khai, Hà Nội", phone: "0909012345", cardType: "Gói PT 6 tháng", startDate: "2024-01-10", endDate: "2024-10-10", status: "Đang hoạt động" },
    { code: "KH020", name: "Hoàng Thị U", birthdate: "1990-08-09", gender: "Nữ", address: "159 Lê Duẩn, Đà Nẵng", phone: "0900123456", cardType: "Gói PT 12 tháng", startDate: "2024-02-10", endDate: "2024-11-10", status: "Đang hoạt động" },
    { code: "KH021", name: "Việt", birthdate: "2000-12-23", gender: "Nam", address: "AG", phone: "0945604640", cardType: "Siêu Vip", startDate: "2025-05-17", endDate: null, status: "Còn hạn" }
  ];

  // Store in localStorage
  localStorage.setItem('customers', JSON.stringify(customerData));
}

// Initialize everything
async function initialize() {
  try {
    await populateStatsCards();
    await populateRevenueTable();
    await initializeRevenueChart();
    initializeTabs();
    initializeRevenueDatePicker();
    initializeCustomerDatePicker();

    await updateFinancialDataByMode('year');

    const btnStatistic = document.getElementById("btnStatistic");
    const btnReset = document.getElementById("btnReset");
    const btnExport = document.getElementById("btnExport");

    if (btnStatistic) btnStatistic.addEventListener("click", handleRevenueStatistics);
    if (btnReset) btnReset.addEventListener("click", handleRevenueRefresh);
    if (btnExport) btnExport.addEventListener("click", exportFinancialTableToExcel);
  } catch (error) {
    console.error("Lỗi khởi tạo ứng dụng:", error);
  }
}

// Start the application
document.addEventListener("DOMContentLoaded", () => {
  if (typeof Chart === "undefined") {
    console.error(
      "Chart.js chưa được tải. Kiểm tra liên kết CDN trong index.html."
    );
    return;
  }
  initialize();
});

function updateCustomerDataFromStorage() {
  const customers = JSON.parse(localStorage.getItem('customers')) || [];
  updateCustomerData(customers);
}

function exportFinancialTableToExcel() {
  const table = document.getElementById("financialTable");
  if (!table) {
    alert("Không tìm thấy bảng dữ liệu!");
    return;
  }
  const wb = XLSX.utils.table_to_book(table, { sheet: "Thống kê" });
  XLSX.writeFile(wb, "thongke-tai-chinh.xlsx");
}