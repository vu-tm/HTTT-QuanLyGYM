document.addEventListener("DOMContentLoaded", function () {
  // Tính toán ngày mặc định: hôm nay và 10 ngày trước
  var defaultStartDate = moment().subtract(10, "days");
  var defaultEndDate = moment();

  // Khởi tạo DateRangePicker
  $("#dateRange").daterangepicker({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
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

  // Đặt giá trị ban đầu cho input
  $("#dateRange").val(
    defaultStartDate.format("DD/MM/YYYY") +
      " - " +
      defaultEndDate.format("DD/MM/YYYY")
  );

  // Xử lý sự kiện khi chọn khoảng thời gian
  $("#dateRange").on("apply.daterangepicker", function (ev, picker) {
    console.log("Ngày bắt đầu: " + picker.startDate.format("DD/MM/YYYY"));
    console.log("Ngày kết thúc: " + picker.endDate.format("DD/MM/YYYY"));
    $(this).val(
      picker.startDate.format("DD/MM/YYYY") +
        " - " +
        picker.endDate.format("DD/MM/YYYY")
    );
  });

  // Xử lý sự kiện khi nhấn Hủy
  $("#dateRange").on("cancel.daterangepicker", function () {
    $(this).val(
      defaultStartDate.format("DD/MM/YYYY") +
        " - " +
        defaultEndDate.format("DD/MM/YYYY")
    );
  });

  // Dữ liệu mẫu cho biểu đồ (có thể thay bằng dữ liệu thực tế)
  const revenueData = {
    "Tổng tiền": { value: 95000000, color: "#4c72b0" },
    "Tổng giảm giá": { value: 25000000, color: "#55a868" },
    "Tổng khuyến mãi": { value: 12500000, color: "#c44e52" },
    "Tổng doanh thu": { value: 57500000, color: "#8172b3" },
    "Tổng nợ": { value: 10000000, color: "#64b5cd" },
    "Thực thu trong kỳ": { value: 47500000, color: "#e59c59" },
    "Số lượng hóa đơn": { value: 120, color: "#75657d" },
    "Số lượng sản phẩm/dịch vụ": { value: 350, color: "#e57b89" },
  };

  // Khởi tạo biểu đồ
  renderRevenueChart(revenueData);

  // Cập nhật tổng số trong summary-grid
  updateSummaryGrid(revenueData);

  // Xử lý sự kiện khi thay đổi khoảng thời gian
  $("#dateRange").on("apply.daterangepicker", function (ev, picker) {
    // Ở đây bạn sẽ gọi API để lấy dữ liệu theo khoảng thời gian được chọn
    // Sau đó cập nhật biểu đồ và bảng dữ liệu với dữ liệu mới
    console.log(
      "Khoảng thời gian mới:",
      picker.startDate.format("DD/MM/YYYY"),
      "đến",
      picker.endDate.format("DD/MM/YYYY")
    );

    // Mô phỏng việc cập nhật dữ liệu
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu mới ở đây
    updateRevenueData();
  });

  // Xử lý sự kiện khi thay đổi kiểu báo cáo
  $('input[name="reportType"]').change(function () {
    // Trong thực tế, bạn sẽ thay đổi cách hiển thị báo cáo dựa trên lựa chọn
    const reportType = $(this).parent().text().trim();
    console.log("Kiểu báo cáo mới:", reportType);

    // Mô phỏng việc cập nhật dữ liệu
    updateRevenueData();
  });

  // Xử lý nút xuất file
  $("#exportBtn").click(function () {
    alert("Đang xuất báo cáo...");
    // Thêm mã xuất báo cáo thành Excel hoặc PDF
  });
});

/**
 * Tạo biểu đồ cột từ dữ liệu doanh thu (hiển thị tỷ lệ phần trăm)
 * @param {Object} data - Dữ liệu doanh thu
 */
function renderRevenueChart(data) {
  const chartArea = document.querySelector(".chart-area");
  if (!chartArea) return;

  // Xóa nội dung cũ nếu có
  chartArea.innerHTML = "";

  // Tạo element SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 800 400");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  chartArea.appendChild(svg);

  // Các thông số của biểu đồ
  const margin = { top: 20, right: 30, bottom: 60, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Tạo group chính
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Tính tổng giá trị (loại bỏ 'Số lượng hóa đơn' và 'Số lượng sản phẩm/dịch vụ')
  let totalValue = 0;
  Object.entries(data).forEach(([key, item]) => {
    if (key !== "Số lượng hóa đơn" && key !== "Số lượng sản phẩm/dịch vụ") {
      totalValue += item.value;
    }
  });

  // Tính tỷ lệ phần trăm cho từng mục (trừ 'Số lượng hóa đơn' và 'Số lượng sản phẩm/dịch vụ')
  const percentages = {};
  Object.entries(data).forEach(([key, item]) => {
    if (key !== "Số lượng hóa đơn" && key !== "Số lượng sản phẩm/dịch vụ") {
      percentages[key] = (item.value / totalValue) * 100;
    }
  });

  // Cấu hình riêng cho 'Số lượng hóa đơn' và 'Số lượng sản phẩm/dịch vụ'
  const countItems = ["Số lượng hóa đơn", "Số lượng sản phẩm/dịch vụ"];
  const maxCount = Math.max(
    data["Số lượng hóa đơn"]?.value || 0,
    data["Số lượng sản phẩm/dịch vụ"]?.value || 0
  );

  // Thêm trục x
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 0);
  xAxis.setAttribute("y1", height);
  xAxis.setAttribute("x2", width);
  xAxis.setAttribute("y2", height);
  xAxis.setAttribute("stroke", "#333");
  xAxis.setAttribute("stroke-width", 2);
  g.appendChild(xAxis);

  // Thêm các đường kẻ ngang cho trục y (hiển thị phần trăm từ 0% đến 100%)
  for (let i = 0; i <= 5; i++) {
    const yPos = height - (i * height) / 5;
    const gridLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    gridLine.setAttribute("x1", 0);
    gridLine.setAttribute("y1", yPos);
    gridLine.setAttribute("x2", width);
    gridLine.setAttribute("y2", yPos);
    gridLine.setAttribute("stroke", i === 0 ? "#333" : "#ddd");
    gridLine.setAttribute("stroke-width", i === 0 ? 2 : 1);
    g.appendChild(gridLine);

    // Thêm nhãn giá trị cho trục y (phần trăm)
    const yLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    yLabel.setAttribute("x", -10);
    yLabel.setAttribute("y", yPos + 5);
    yLabel.setAttribute("text-anchor", "end");
    yLabel.setAttribute("font-family", "Arial");
    yLabel.setAttribute("font-size", "12");
    yLabel.textContent = `${i * 20}%`; // Hiển thị từ 0% đến 100%
    g.appendChild(yLabel);
  }

  // Thêm nhãn cho trục y
  const yAxisLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  yAxisLabel.setAttribute("transform", "rotate(-90)");
  yAxisLabel.setAttribute("x", -height / 2);
  yAxisLabel.setAttribute("y", -40);
  yAxisLabel.setAttribute("text-anchor", "middle");
  yAxisLabel.setAttribute("font-family", "Arial");
  yAxisLabel.setAttribute("font-size", "14");
  yAxisLabel.textContent = "Tỷ lệ (%)";
  g.appendChild(yAxisLabel);

  // Tính toán độ rộng của mỗi cột
  const barWidth = (width / Object.keys(data).length) * 0.7;
  const barSpacing = width / Object.keys(data).length;

  // Thêm các cột và nhãn
  let index = 0;
  Object.entries(data).forEach(([key, item]) => {
    const x = index * barSpacing + (barSpacing - barWidth) / 2;

    // Xác định chiều cao của cột
    let barHeight, barY, valueText;
    if (countItems.includes(key)) {
      // Đối với số lượng, tính tỷ lệ dựa trên maxCount
      barHeight = (item.value / maxCount) * (height * 0.6);
      barY = height - barHeight;
      valueText = item.value.toString();
    } else {
      // Đối với giá trị tiền, tính tỷ lệ phần trăm
      barHeight = (percentages[key] / 100) * height;
      barY = height - barHeight;
      valueText = percentages[key].toFixed(1) + "%";
    }

    // Tạo gradient cho cột
    const gradientId = `barGradient${index}`;
    const gradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    gradient.setAttribute("id", gradientId);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");

    // Thêm stop cho gradient
    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", `stop-color:${item.color};stop-opacity:1`);
    gradient.appendChild(stop1);

    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute(
      "style",
      `stop-color:${darkenColor(item.color, 20)};stop-opacity:1`
    );
    gradient.appendChild(stop2);

    // Thêm gradient vào defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Tạo cột
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", x);
    bar.setAttribute("y", barY);
    bar.setAttribute("width", barWidth);
    bar.setAttribute("height", barHeight);
    bar.setAttribute("rx", 4);
    bar.setAttribute("fill", `url(#${gradientId})`);
    g.appendChild(bar);

    // Thêm nhãn cho cột (giá trị)
    const valueLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    valueLabel.setAttribute("x", x + barWidth / 2);
    valueLabel.setAttribute("y", barY - 5);
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.setAttribute("font-family", "Arial");
    valueLabel.setAttribute("font-size", "12");
    valueLabel.setAttribute("font-weight", "bold");
    valueLabel.textContent = valueText;
    g.appendChild(valueLabel);

    // Thêm nhãn cho cột (tên)
    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    label.setAttribute("x", x + barWidth / 2);
    label.setAttribute("y", height + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "Arial");
    label.setAttribute("font-size", "12");
    label.textContent = key
      .replace(/Tổng |Số lượng /g, "")
      .replace(/\/dịch vụ/g, "/DV");
    g.appendChild(label);

    index++;
  });

  // Thêm tiêu đề biểu đồ
  const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
  title.setAttribute("x", width / 2);
  title.setAttribute("y", -5);
  title.setAttribute("text-anchor", "middle");
  title.setAttribute("font-family", "Arial");
  title.setAttribute("font-size", "16");
  title.setAttribute("font-weight", "bold");
  title.textContent = "Báo cáo doanh thu hóa đơn (Tỷ lệ %)";
  g.appendChild(title);
}

/**
 * Cập nhật dữ liệu trong bảng tổng hợp
 * @param {Object} data - Dữ liệu doanh thu
 */
function updateSummaryGrid(data) {
  const summaryItems = document.querySelectorAll(".summary-item .value");

  if (summaryItems.length === 8) {
    // Cập nhật các giá trị trong summary grid
    summaryItems[0].textContent = formatCurrency(data["Tổng tiền"].value);
    summaryItems[1].textContent = formatCurrency(data["Tổng giảm giá"].value);
    summaryItems[2].textContent = formatCurrency(data["Tổng khuyến mãi"].value);
    summaryItems[3].textContent = formatCurrency(data["Tổng doanh thu"].value);
    summaryItems[4].textContent = formatCurrency(data["Tổng nợ"].value);
    summaryItems[5].textContent = formatCurrency(
      data["Thực thu trong kỳ"].value
    );
    summaryItems[6].textContent = data["Số lượng hóa đơn"].value;
    summaryItems[7].textContent = data["Số lượng sản phẩm/dịch vụ"].value;
  }
}

/**
 * Mô phỏng việc cập nhật dữ liệu khi thay đổi bộ lọc
 */
function updateRevenueData() {
  // Tạo dữ liệu ngẫu nhiên cho mục đích demo
  const randomData = {
    "Tổng tiền": {
      value: Math.random() * 100000000 + 50000000,
      color: "#4c72b0",
    },
    "Tổng giảm giá": { value: Math.random() * 30000000, color: "#55a868" },
    "Tổng khuyến mãi": { value: Math.random() * 20000000, color: "#c44e52" },
    "Tổng doanh thu": { value: 0, color: "#8172b3" },
    "Tổng nợ": { value: Math.random() * 15000000, color: "#64b5cd" },
    "Thực thu trong kỳ": { value: 0, color: "#e59c59" },
    "Số lượng hóa đơn": {
      value: Math.floor(Math.random() * 200) + 50,
      color: "#75657d",
    },
    "Số lượng sản phẩm/dịch vụ": {
      value: Math.floor(Math.random() * 400) + 100,
      color: "#e57b89",
    },
  };

  // Tính toán các giá trị phụ thuộc
  randomData["Tổng doanh thu"].value =
    randomData["Tổng tiền"].value -
    randomData["Tổng giảm giá"].value -
    randomData["Tổng khuyến mãi"].value;
  randomData["Thực thu trong kỳ"].value =
    randomData["Tổng doanh thu"].value - randomData["Tổng nợ"].value;

  // Cập nhật biểu đồ và bảng tổng hợp
  renderRevenueChart(randomData);
  updateSummaryGrid(randomData);

  // Mô phỏng cập nhật bảng dữ liệu
  updateSampleData();
}

/**
 * Mô phỏng cập nhật bảng dữ liệu chi tiết
 */
function updateSampleData() {
  const detailTable = document.querySelector(".detail-section table tbody");
  const saleTable = document.querySelector(".time-sales-report table tbody");

  if (detailTable) {
    // Xóa thông báo không có dữ liệu
    detailTable.innerHTML = "";

    // Thêm dữ liệu mẫu cho bảng chi tiết
    for (let i = 1; i <= 10; i++) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i}</td>
        <td>${formatDate(new Date(2025, 4, i))}</td>
        <td>HD${String(i).padStart(5, "0")}</td>
        <td>KH${String(Math.floor(Math.random() * 1000)).padStart(5, "0")}</td>
        <td>Khách hàng ${i}</td>
        <td>Nhân viên ${Math.floor(Math.random() * 5) + 1}</td>
        <td>${formatCurrency(Math.random() * 10000000 + 1000000)}</td>
        <td>${formatCurrency(Math.random() * 1000000)}</td>
        <td>${formatCurrency(Math.random() * 500000)}</td>
      `;
      detailTable.appendChild(row);
    }
  }

  if (saleTable) {
    // Xóa thông báo không có dữ liệu
    saleTable.innerHTML = "";

    // Thêm dữ liệu mẫu cho bảng doanh thu theo thời gian
    for (let i = 1; i <= 7; i++) {
      const date = new Date(2025, 4, i);
      const totalAmount = Math.random() * 15000000 + 5000000;
      const discount = Math.random() * 3000000;
      const promotion = Math.random() * 1500000;
      const revenue = totalAmount - discount - promotion;
      const debt = Math.random() * 2000000;
      const actualRevenue = revenue - debt;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${formatDate(date)}</td>
        <td>${formatCurrency(totalAmount)}</td>
        <td>${formatCurrency(discount)}</td>
        <td>${formatCurrency(promotion)}</td>
        <td>${formatCurrency(revenue)}</td>
        <td>${formatCurrency(debt)}</td>
        <td>${formatCurrency(actualRevenue)}</td>
      `;
      saleTable.appendChild(row);
    }
  }
}

/**
 * Định dạng số tiền thành chuỗi có dấu phân cách
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Định dạng ngày tháng
 * @param {Date} date - Đối tượng ngày cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Làm tối màu một hex color
 * @param {string} hex - Mã màu hex
 * @param {number} percent - Phần trăm làm tối
 * @returns {string} Mã màu đã làm tối
 */
function darkenColor(hex, percent) {
  // Chuyển đổi hex sang rgb
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Làm tối các giá trị
  r = Math.max(0, Math.floor((r * (100 - percent)) / 100));
  g = Math.max(0, Math.floor((g * (100 - percent)) / 100));
  b = Math.max(0, Math.floor((b * (100 - percent)) / 100));

  // Chuyển đổi trở lại hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
