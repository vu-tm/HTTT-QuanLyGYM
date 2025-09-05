// Khởi tạo khi trang được load
$(document).ready(function() {
  console.log('Trang đã được load');
  
  // Khởi tạo date range picker
  $('.date-input').daterangepicker({
    locale: {
      format: 'DD/MM/YYYY'
    }
  });

  // Thêm event listener cho các radio button
  $('input[name="data-type"]').change(function() {
    console.log('Loại dữ liệu đã thay đổi:', $(this).attr('id'));
    updateDataBasedOnFilters();
  });

  $('input[name="report-type"]').change(function() {
    console.log('Loại báo cáo đã thay đổi:', $(this).attr('id'));
    updateDataBasedOnFilters();
  });

  // Thêm event listener cho date range picker
  $('.date-input').on('apply.daterangepicker', function(ev, picker) {
    console.log('Khoảng thời gian đã thay đổi:', picker.startDate.format('DD/MM/YYYY'), 'đến', picker.endDate.format('DD/MM/YYYY'));
    updateDataBasedOnFilters();
  });

  // Gọi lần đầu để load dữ liệu
  updateDataBasedOnFilters();
});

document.addEventListener("DOMContentLoaded", function () {
  // Tính toán ngày mặc định: hôm nay và 10 ngày trước
  var defaultStartDate = moment().subtract(10, "days");
  var defaultEndDate = moment();

  // Khởi tạo DateRangePicker cho phần "Thời gian"
  $(".date-input").daterangepicker({
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
  $(".date-input").val(
    defaultStartDate.format("DD/MM/YYYY") +
      " - " +
      defaultEndDate.format("DD/MM/YYYY")
  );

  // Xử lý sự kiện khi chọn khoảng thời gian
  $(".date-input").on("apply.daterangepicker", function (ev, picker) {
    console.log("Ngày bắt đầu: " + picker.startDate.format("DD/MM/YYYY"));
    console.log("Ngày kết thúc: " + picker.endDate.format("DD/MM/YYYY"));
    $(this).val(
      picker.startDate.format("DD/MM/YYYY") +
        " - " +
        picker.endDate.format("DD/MM/YYYY")
    );
    updateDataBasedOnFilters();
  });

  // Xử lý sự kiện khi nhấn Hủy
  $(".date-input").on("cancel.daterangepicker", function () {
    $(this).val(
      defaultStartDate.format("DD/MM/YYYY") +
        " - " +
        defaultEndDate.format("DD/MM/YYYY")
    );
  });

  
  
  // Xử lý sự kiện thay đổi loại dữ liệu
  $('input[name="data-type"]').change(function () {
    const dataType = $(this).attr("id");
    console.log("Loại dữ liệu mới:", dataType);
    updateDataBasedOnFilters();
  });

  // Xử lý sự kiện thay đổi loại thống kê
  $('input[name="report-type"]').change(function () {
    const reportType = $(this).attr("id");
    console.log("Loại thống kê mới:", reportType);
    updateDataBasedOnFilters();
  });

  // Xử lý nút xuất file
  $(".export-btn").click(function () {
    // Xác định bảng doanh thu đang hiển thị
    let tableSection = null;
    if ($('.revenue-table-time').is(':visible')) tableSection = $('.revenue-table-time');
    else if ($('.revenue-table-product').is(':visible')) tableSection = $('.revenue-table-product');
    else if ($('.revenue-table-employee').is(':visible')) tableSection = $('.revenue-table-employee');
    if (!tableSection || tableSection.length === 0) {
      alert('Không tìm thấy bảng dữ liệu để xuất!');
      return;
    }
    const table = tableSection.find('table')[0];
    if (!table) {
      alert('Không tìm thấy bảng dữ liệu để xuất!');
      return;
    }
    // Chuyển đổi bảng HTML sang worksheet
    const ws = XLSX.utils.table_to_sheet(table);
    // Tạo workbook và thêm worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DoanhThu');
    // Tạo tên file theo loại báo cáo
    const dataType = $('input[name="data-type"]:checked').attr("id");
    const reportType = $('input[name="report-type"]:checked').attr("id");
    const dateStr = moment().format('YYYYMMDD_HHmmss');
    let fileName = `DoanhThu_${dataType}_${reportType}_${dateStr}.xlsx`;
    // Xuất file
    XLSX.writeFile(wb, fileName);
  });

  // Khi thay đổi bộ lọc, gọi lại updateDataBasedOnFilters
  $('input[name="data-type"]').change(updateDataBasedOnFilters);
  $('input[name="report-type"]').change(updateDataBasedOnFilters);
  $(".date-input").on("apply.daterangepicker", updateDataBasedOnFilters);

  // Lần đầu load
  updateDataBasedOnFilters();
});

/**
 * Tạo biểu đồ cột từ dữ liệu doanh thu
 * @param {Object} data - Dữ liệu doanh thu
 */
function renderRevenueChart(data) {
  const chartArea = document.querySelector(".chart-grid");
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
  const margin = { top: 40, right: 30, bottom: 60, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Tạo group chính
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Lọc dữ liệu: loại bỏ 'Số lượng hóa đơn' và 'Số lượng sản phẩm/dịch vụ'
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(
      ([key]) =>
        key !== "Số lượng hóa đơn" && key !== "Số lượng sản phẩm/dịch vụ"
    )
  );

  // Tính tổng giá trị của các mục còn lại
  let totalValue = 0;
  Object.entries(filteredData).forEach(([key, item]) => {
    if (item && typeof item.value === 'number' && !isNaN(item.value)) {
      totalValue += item.value;
    }
  });

  // Nếu không có dữ liệu hợp lệ, hiển thị thông báo
  if (totalValue === 0) {
    chartArea.innerHTML = '<div class="no-data">Không có dữ liệu</div>';
    return;
  }

  // Tính tỷ lệ phần trăm cho từng mục
  const percentages = {};
  Object.entries(filteredData).forEach(([key, item]) => {
    if (item && typeof item.value === 'number' && !isNaN(item.value)) {
      percentages[key] = (item.value / totalValue) * 100;
    } else {
      percentages[key] = 0;
    }
  });

  // Thêm trục x
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 0);
  xAxis.setAttribute("y1", height);
  xAxis.setAttribute("x2", width);
  xAxis.setAttribute("y2", height);
  xAxis.setAttribute("stroke", "#333");
  xAxis.setAttribute("stroke-width", 2);
  g.appendChild(xAxis);

  // Thêm các đường kẻ ngang cho trục y
  for (let i = 0; i <= 5; i++) {
    const yPos = height - (i * height) / 5;
    const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    gridLine.setAttribute("x1", 0);
    gridLine.setAttribute("y1", yPos);
    gridLine.setAttribute("x2", width);
    gridLine.setAttribute("y2", yPos);
    gridLine.setAttribute("stroke", i === 0 ? "#333" : "#ddd");
    gridLine.setAttribute("stroke-width", i === 0 ? 2 : 1);
    g.appendChild(gridLine);

    // Thêm nhãn giá trị cho trục y
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", -10);
    yLabel.setAttribute("y", yPos + 5);
    yLabel.setAttribute("text-anchor", "end");
    yLabel.setAttribute("font-family", "Arial");
    yLabel.setAttribute("font-size", "12");
    yLabel.textContent = ((maxAmount * i) / 5 / 1000000).toFixed(2);
    g.appendChild(yLabel);
  }

  // Thêm nhãn cho trục y
  const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yAxisLabel.setAttribute("transform", "rotate(-90)");
  yAxisLabel.setAttribute("x", -height / 2);
  yAxisLabel.setAttribute("y", -60);
  yAxisLabel.setAttribute("text-anchor", "middle");
  yAxisLabel.setAttribute("font-family", "Arial");
  yAxisLabel.setAttribute("font-size", "14");
  yAxisLabel.textContent = "Tỷ lệ (%)";
  g.appendChild(yAxisLabel);

  // Tính toán độ rộng của mỗi cột
  const barWidth = (width / Object.keys(filteredData).length) * 0.7;
  const barSpacing = width / Object.keys(filteredData).length;

  // Thêm các cột và nhãn
  let index = 0;
  Object.entries(filteredData).forEach(([key, item]) => {
    if (!item || typeof item.value !== 'number' || isNaN(item.value)) return;

    const x = index * barSpacing + (barSpacing - barWidth) / 2;
    const percentage = percentages[key] || 0;
    const barHeight = Math.max(0, (percentage / 100) * height);
    const barY = height - barHeight;
    const valueText = percentage.toFixed(1) + "%";

    // Tạo gradient cho cột
    const gradientId = `barGradient${index}`;
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", gradientId);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");

    // Thêm stop cho gradient
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", `stop-color:${item.color || '#4CAF50'};stop-opacity:1`);
    gradient.appendChild(stop1);

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("style", `stop-color:${darkenColor(item.color || '#4CAF50', 20)};stop-opacity:1`);
    gradient.appendChild(stop2);

    // Thêm gradient vào defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Tạo cột
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", x.toString());
    bar.setAttribute("y", barY.toString());
    bar.setAttribute("width", barWidth.toString());
    bar.setAttribute("height", barHeight.toString());
    bar.setAttribute("rx", "4");
    bar.setAttribute("fill", `url(#${gradientId})`);
    g.appendChild(bar);

    // Thêm nhãn cho cột (giá trị)
    const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valueLabel.setAttribute("x", (x + barWidth / 2).toString());
    valueLabel.setAttribute("y", (barY - 5).toString());
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.setAttribute("font-family", "Arial");
    valueLabel.setAttribute("font-size", "12");
    valueLabel.setAttribute("font-weight", "bold");
    valueLabel.textContent = valueText;
    g.appendChild(valueLabel);

    // Thêm nhãn cho cột (tên)
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", (x + barWidth / 2).toString());
    label.setAttribute("y", (height + 20).toString());
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "Arial");
    label.setAttribute("font-size", "12");
    label.textContent = key.replace(/Tổng /g, "");
    g.appendChild(label);

    index++;
  });

  // Trước khi vẽ biểu đồ, cập nhật tiêu đề vào .chart-header
  const chartHeader = document.querySelector('.chart-header');
  if (chartHeader) {
    if (dataType === "ban-hang" && reportType === "theo-thoi-gian") {
      chartHeader.innerHTML = '<h3>Báo cáo doanh thu bán hàng theo thời gian</h3>';
    } else if (dataType === "nhap-hang" && reportType === "theo-thoi-gian") {
      chartHeader.innerHTML = '<h3>Báo cáo doanh thu nhập hàng theo thời gian</h3>';
    } else if (dataType === "ban-hang" && reportType === "theo-san-pham") {
      chartHeader.innerHTML = '<h3>Top 10 sản phẩm bán chạy</h3>';
    } else if (dataType === "nhap-hang" && reportType === "theo-san-pham") {
      chartHeader.innerHTML = '<h3>Top 10 sản phẩm nhập nhiều</h3>';
    } else if (dataType === "ban-hang" && reportType === "theo-nhan-vien") {
      chartHeader.innerHTML = '<h3>Doanh thu theo nhân viên bán hàng</h3>';
    } else if (dataType === "nhap-hang" && reportType === "theo-nhan-vien") {
      chartHeader.innerHTML = '<h3>Doanh thu theo nhân viên nhập hàng</h3>';
    } else {
      chartHeader.innerHTML = '<h3>Báo cáo doanh thu</h3>';
    }
  }
}

/**
 * Cập nhật dữ liệu khi thay đổi bộ lọc
 */
async function updateDataBasedOnFilters() {
  try {
    // Lấy giá trị các bộ lọc
    const dataType = $('input[name="data-type"]:checked').attr("id");
    const reportType = $('input[name="report-type"]:checked').attr("id");
    const dateRangeInput = $(".date-input").val();
    console.log('Date Range Input:', dateRangeInput); // Log input string
    const [startDate, endDate] = dateRangeInput.split(" - ").map(date => moment(date, "DD/MM/YYYY"));
    console.log('Parsed StartDate:', startDate.format(), 'Parsed EndDate:', endDate.format()); // Log parsed dates
    const start = startDate.format('YYYY-MM-DD'); // Chuẩn hóa ngày bắt đầu
    const end = endDate.format('YYYY-MM-DD'); // Chuẩn hóa ngày kết thúc
    console.log('Formatted Start Date:', start, 'Formatted End Date:', end); // Log formatted dates
    // Lấy dữ liệu từ API
    const { invoices, purchases } = await fetchSalesData();

    console.log('Purchases data immediately after fetch:', purchases); // <--- Add this line

    let filteredData = {
      invoices: [],
      purchases: []
    };

    // Lọc dữ liệu theo loại
    if (dataType === "ban-hang") {
      filteredData.invoices = invoices.filter(inv => {
        const invoiceDate = moment(inv.time);
        // Lọc theo trạng thái "Hoàn thành", loại "Bán hàng" VÀ có ít nhất 1 item là sản phẩm (có product_code)
        return inv.status === "Hoàn thành" &&
               inv.type === "Bán hàng" &&
               invoiceDate.isBetween(startDate, endDate, 'day', '[]') &&
               inv.items && inv.items.some(item => item.product_code);
      });
      console.log('Hóa đơn bán sản phẩm đã lọc:', filteredData.invoices);
    } else if (dataType === "nhap-hang") {
      // Tìm chuỗi trạng thái "Đã nhập" chính xác từ dữ liệu
      let daNhapStatusFromData = "Đã nhập"; // Giá trị mặc định
      const samplePurchase = purchases.find(p => p.status && p.status.includes("nhập")); // Tìm một bản ghi mẫu có chứa "nhập"
      if (samplePurchase && samplePurchase.status) {
           // Sử dụng chuỗi trạng thái chính xác từ bản ghi mẫu sau khi trim
           // Kiểm tra thêm lowercase để an toàn, sau đó lấy chuỗi gốc đã trim nếu khớp
           if (samplePurchase.status.trim().toLowerCase() === "đã nhập") {
                daNhapStatusFromData = samplePurchase.status.trim();
           } else {
               // Log cảnh báo nếu tìm thấy trạng thái có "nhập" nhưng không khớp chính xác "Đã nhập"
               console.warn('Found status with "nhập" but not exactly "Đã nhập":', samplePurchase.status);
           }
      } else {
          console.warn('No sample purchase with "nhập" status found in data.');
      }


      filteredData.purchases = purchases; // <-- Changed this line

      console.log('Phiếu nhập đã lọc (frontend filter removed):', filteredData.purchases); // Cập nhật thông báo log
    }

    // Tính toán các chỉ số tổng hợp
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalPromotion = 0;
    let totalDebt = 0;
    let totalInvoices = 0;
    let totalItems = 0;

    // Cập nhật tiêu đề chính và ẩn/hiện summary grid
    const mainHeader = document.querySelector('.main-content .header h2');
    const salesSummary = document.getElementById('sales-summary');
    const importsSummary = document.getElementById('imports-summary');
    const employeeReportOption = document.getElementById('theo-nhan-vien').closest('.radio-option');

    if (dataType === "ban-hang") {
        if (mainHeader) mainHeader.textContent = 'Báo cáo bán hàng';
        if (salesSummary) salesSummary.style.display = '';
        if (importsSummary) importsSummary.style.display = 'none';
        if (employeeReportOption) employeeReportOption.style.display = '';

      filteredData.invoices.forEach(invoice => {
        if (invoice.status === "Hoàn thành") {
          totalAmount += invoice.totalAmount || 0;
          totalDiscount += invoice.discount || 0;
          totalPromotion += invoice.promotion || 0;
          totalDebt += invoice.debt || 0;
          totalInvoices++;
          totalItems += (invoice.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
        }
      });
       let totalRevenueForSales = totalAmount - totalDiscount;
       let actualRevenueForSales = totalRevenueForSales - totalDebt;

       updateSummaryItems({
        dataType: dataType, // Pass dataType to updateSummaryItems
        totalAmount: totalAmount,
        totalDiscount: totalDiscount,
        totalPromotion: totalPromotion,
        totalDebt: totalDebt,
        actualRevenue: actualRevenueForSales,
        totalInvoices: totalInvoices,
        totalItems: totalItems
      });

    } else if (dataType === "nhap-hang") {
         if (mainHeader) mainHeader.textContent = 'Báo cáo nhập hàng';
         if (salesSummary) salesSummary.style.display = 'none';
         if (importsSummary) importsSummary.style.display = '';
         if (employeeReportOption) employeeReportOption.style.display = 'none';

      // Đã loại bỏ vòng lặp tính tổng ở đây vì updateSummaryItems sẽ tự tính toán
      // filteredData.purchases.forEach(purchase => { ... });

      console.log('Filtered Imports Data:', filteredData.purchases);
      // console.log('Calculated Total Items for Imports:', totalItems); // Log này không còn cần thiết ở đây

       // Truyền toàn bộ filteredData vào updateSummaryItems
       // updateSummaryItems(filteredData);

    }

    // Tạo đối tượng dữ liệu cuối cùng để truyền cho các hàm hiển thị
    const dataToRender = {
        dataType: dataType, // Thêm dataType vào đây
        invoices: filteredData.invoices,
        purchases: filteredData.purchases
    };

    console.log('Data to be rendered:', dataToRender); // Log đối tượng cuối cùng

    // Cập nhật các chỉ số tổng hợp
    updateSummaryItems(dataToRender);

    // Cập nhật biểu đồ
    updateChart(dataType, reportType, dataToRender); // updateChart nhận dataType, reportType, data

    // Cập nhật bảng dữ liệu
    updateDataTables(dataType, reportType, filteredData);

    // Cập nhật bảng doanh thu theo loại thống kê
    updateRevenueTableByType(filteredData, dataType, reportType);

    // Nếu loại dữ liệu là nhập hàng và loại thống kê là theo nhân viên, chuyển về theo thời gian
    if (dataType === 'nhap-hang' && reportType === 'theo-nhan-vien') {
        // Reset the report type radio button to 'theo-thoi-gian'
        document.getElementById('theo-thoi-gian').checked = true;
        // Explicitly call update with 'theo-thoi-gian' report type
        updateChart(dataType, 'theo-thoi-gian', filteredData);
        updateRevenueTableByType(filteredData, dataType, 'theo-thoi-gian');
    }

  } catch (error) {
    console.error('Lỗi khi cập nhật dữ liệu:', error);
  }
}

/**
 * Tạo yêu cầu fetch để lấy dữ liệu hóa đơn và phiếu nhập
 */
async function fetchSalesData() {
  try {
    // Lấy hóa đơn bán hàng
    const invoicesRes = await fetch('http://localhost:5000/api/invoices');
    if (!invoicesRes.ok) {
      throw new Error('Lỗi khi lấy dữ liệu hóa đơn');
    }
    const invoices = await invoicesRes.json();
    console.log('Dữ liệu hóa đơn:', invoices);

    // Lấy ngày từ bộ lọc
    const dateRangeInput = $(".date-input").val();
    const [startDate, endDate] = dateRangeInput.split(" - ").map(date => moment(date, "DD/MM/YYYY"));
    const startFormatted = startDate.format('YYYY-MM-DD');
    const endFormatted = endDate.format('YYYY-MM-DD');

    // Lấy phiếu nhập hàng có lọc theo ngày
    const importsRes = await fetch(`http://localhost:5000/api/imports?startDate=${startFormatted}&endDate=${endFormatted}`);
    if (!importsRes.ok) {
      throw new Error('Lỗi khi lấy dữ liệu phiếu nhập');
    }
    const importsData = await importsRes.json();
    const purchases = importsData.data || [];
    console.log('Dữ liệu phiếu nhập:', purchases);

    return { invoices, purchases };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
    return { invoices: [], purchases: [] };
  }
}

/**
 * Cập nhật các summary items
 */
function updateSummaryItems(data) {
  console.log('updateSummaryItems received data:', data); // Log data here
  console.log('dataType received:', data.dataType, 'Is nhap-hang?', data.dataType === "nhap-hang"); // <--- Add this log
  // Cập nhật các giá trị tổng hợp dựa trên loại dữ liệu
   if (data.dataType === "ban-hang") {
      // Update sales summary items
      const summaryItems = document.querySelectorAll('#sales-summary .summary-item .summary-value');
      if (!summaryItems || summaryItems.length < 7) return; // Ensure enough items exist

      // Tính toán lại các giá trị từ dữ liệu hóa đơn
      let totalAmount = 0;
      let totalInvoices = 0;
      let totalItems = 0;

      if (data.invoices && Array.isArray(data.invoices)) {
        data.invoices.forEach(invoice => {
          if (invoice.status === "Hoàn thành") {
            totalAmount += invoice.totalAmount || 0; // Sử dụng totalAmount
            totalInvoices++; // Đếm hóa đơn hoàn thành
            totalItems += (invoice.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0); // Tính tổng số lượng sản phẩm
          }
        });
      }

      // Các giá trị không có sẵn trong dữ liệu hiện tại sẽ là 0
      let totalDiscount = 0; 
      let totalPromotion = 0;
      let totalDebt = 0;
      let actualRevenue = totalAmount; // Coi như thực thu bằng tổng tiền nếu không có giảm giá/nợ

      summaryItems[0].textContent = formatCurrency(totalAmount); // Tổng tiền
      summaryItems[1].textContent = formatCurrency(totalDiscount); // Tổng giảm giá (hiện tại 0)
      summaryItems[2].textContent = formatCurrency(totalAmount); // Tổng doanh thu (bằng tổng tiền)
      summaryItems[3].textContent = formatCurrency(totalDebt); // Tổng nợ (hiện tại 0)
      summaryItems[4].textContent = formatCurrency(actualRevenue); // Tổng tiền thực thu (bằng tổng tiền)
      summaryItems[5].textContent = totalInvoices; // Số lượng hóa đơn
      summaryItems[6].textContent = totalItems; // Số lượng sản phẩm

   } else if (data.dataType === "nhap-hang") {
       // Update imports summary items
      const summaryItems = document.querySelectorAll('#imports-summary .summary-item .summary-value');
      console.log('summaryItems for imports:', summaryItems, 'Length:', summaryItems ? summaryItems.length : 0); // <--- Log vẫn giữ để debug
      // if (!summaryItems || summaryItems.length < 5) return; // <--- Remove this check

      // Tính toán tổng tiền nhập, tiền đã trả, tiền còn nợ từ dữ liệu đã lọc
      let totalImportAmount = 0;
      let totalPaidAmount = 0;
      let totalRemainingDebt = 0;
      let totalImportSlips = 0;
      let totalImportedItems = 0;

      if (data.purchases && Array.isArray(data.purchases)) {
        totalImportSlips = data.purchases.length; // Số lượng phiếu nhập là số lượng bản ghi sau lọc
        data.purchases.forEach(purchase => {
          console.log('Processing purchase in updateSummaryItems:', purchase); // <--- Add this log
          totalImportAmount += purchase.totalAmount || 0;
          totalPaidAmount += purchase.paidAmount || 0; // Sử dụng paidAmount từ dữ liệu
          totalRemainingDebt += (purchase.totalAmount || 0) - (purchase.paidAmount || 0); // Tính toán tiền còn nợ
          if (purchase.items && Array.isArray(purchase.items)) {
             totalImportedItems += purchase.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
          }
        });
      }

      summaryItems[0].textContent = formatCurrency(totalImportAmount); // Tổng tiền nhập
      summaryItems[1].textContent = formatCurrency(totalPaidAmount); // Tổng tiền đã trả
      summaryItems[2].textContent = formatCurrency(totalRemainingDebt); // Tổng tiền còn nợ
      summaryItems[3].textContent = totalImportSlips; // Số lượng phiếu nhập
      summaryItems[4].textContent = totalImportedItems; // Tổng số lượng sản phẩm nhập
   }
}

/**
 * Cập nhật biểu đồ dựa trên loại dữ liệu và loại thống kê
 */
function updateChart(dataType, reportType, data) {
  console.log('updateChart received data:', data); // Log data here
  // Cập nhật tiêu đề
  const chartHeader = document.querySelector('.chart-header');
  if (chartHeader) {
    if (dataType === "ban-hang" && reportType === "theo-thoi-gian") {
      chartHeader.innerHTML = '<h3>Báo cáo doanh thu bán hàng theo thời gian</h3>';
    } else if (dataType === "nhap-hang" && reportType === "theo-thoi-gian") {
      chartHeader.innerHTML = '<h3>Báo cáo doanh thu nhập hàng theo thời gian</h3>';
    } else if (dataType === "ban-hang" && reportType === "theo-san-pham") {
      chartHeader.innerHTML = '<h3>Top 10 sản phẩm bán chạy</h3>';
    } else if (dataType === "nhap-hang" && reportType === "theo-san-pham") {
      chartHeader.innerHTML = '<h3>Top 10 sản phẩm nhập nhiều</h3>';
    } else if (dataType === "ban-hang" && reportType === "theo-nhan-vien") {
      chartHeader.innerHTML = '<h3>Doanh thu theo nhân viên bán hàng</h3>';
    } else if (dataType === "nhap-hang" && reportType === "theo-nhan-vien") {
      chartHeader.innerHTML = '<h3>Doanh thu theo nhân viên nhập hàng</h3>';
    } else {
      chartHeader.innerHTML = '<h3>Báo cáo doanh thu</h3>';
    }
  }

  // Sau đó gọi hàm vẽ biểu đồ
  if (reportType === "theo-thoi-gian") {
    renderTimeBasedChart(data, dataType);
  } else if (reportType === "theo-san-pham") {
    renderProductBasedChart(data, dataType);
  } else if (reportType === "theo-nhan-vien") {
    renderEmployeeBasedChart(data, dataType);
  }
}

/**
 * Vẽ biểu đồ theo thời gian
 */
function renderTimeBasedChart(data, dataType) {
  console.log('renderTimeBasedChart received data:', data); // Log data here
  const chartGrid = document.querySelector('.chart-grid');
  if (!chartGrid) return;

  // Xóa nội dung cũ
  chartGrid.innerHTML = '';

  // Tạo element SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 800 400");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  chartGrid.appendChild(svg);

  // Các thông số của biểu đồ
  const margin = { top: 40, right: 30, bottom: 60, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Tạo group chính
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Nhóm dữ liệu theo ngày
  const dailyData = {};
  
  if (dataType === "ban-hang" && data.invoices) {
    data.invoices.forEach(invoice => {
      if (invoice.status === "Hoàn thành") {
        const date = moment(invoice.time).format("YYYY-MM-DD");
        if (!dailyData[date]) {
          dailyData[date] = {
            totalAmount: 0,
            count: 0
          };
        }
        dailyData[date].totalAmount += invoice.totalAmount;
        dailyData[date].count++;
      }
    });
  } else if (dataType === "nhap-hang" && data.purchases) {
    data.purchases.forEach(purchase => {
      console.log('Processing purchase in renderTimeBasedChart:', purchase); // <--- Log vẫn giữ

      // Chuẩn hóa và so sánh trạng thái <--- Changed comment
      // const dbStatus = purchase.status ? purchase.status.normalize('NFC').trim().toLowerCase() : ''; <--- Old normalization
      // const targetStatus = "Đã nhập".normalize('NFC').toLowerCase(); <--- Old normalization
      // console.log(`renderTimeBasedChart - Normalized DB Status: ${dbStatus}, Normalized Target Status: ${targetStatus}, Includes Match: ${dbStatus.includes(targetStatus)}`); // <--- Old log

      // Kiểm tra trạng thái bằng cách tìm từ "nhập" (không phân biệt hoa thường, bỏ khoảng trắng)
      const dbStatusClean = purchase.status ? purchase.status.trim().toLowerCase() : ''; // Làm sạch trạng thái DB
      const targetKeyword = "nhập"; // Từ khóa cần tìm

      console.log(`renderTimeBasedChart - Cleaned DB Status: '${dbStatusClean}', Target Keyword: '${targetKeyword}', Includes Keyword: ${dbStatusClean.includes(targetKeyword)}`); // <--- Add this log

      // if (dbStatus.includes(targetStatus)) { // <--- Changed this condition to use normalized includes <--- Old condition
      if (dbStatusClean.includes(targetKeyword)) { // <--- Changed this condition to check for keyword
        console.log('renderTimeBasedChart - Status matches (keyword), processing purchase:', purchase); // <--- Log này sẽ xuất hiện nếu điều kiện đúng
        const date = moment(purchase.time).format("YYYY-MM-DD");
        if (!dailyData[date]) {
          dailyData[date] = {
            totalAmount: 0,
            count: 0
          };
        }
        dailyData[date].totalAmount += purchase.totalAmount || 0; // Đảm bảo cộng với 0 nếu totalAmount là null/undefined
        console.log('renderTimeBasedChart - Adding totalAmount to dailyData:', purchase.totalAmount, 'for date:', date); // <--- Add this log
        dailyData[date].count++;
      }
    });
  }

  // Sắp xếp dữ liệu theo ngày
  const sortedDates = Object.keys(dailyData).sort();
  console.log('renderTimeBasedChart - dailyData:', dailyData); // <--- Add this log
  console.log('renderTimeBasedChart - sortedDates:', sortedDates); // <--- Add this log
  if (sortedDates.length === 0) {
    chartGrid.innerHTML = '<div class="no-data">Không có dữ liệu</div>';
    return;
  }

  const amounts = sortedDates.map(date => dailyData[date].totalAmount);
  console.log('renderTimeBasedChart - amounts:', amounts); // <--- Add this log
  const maxAmount = Math.max(...amounts);
  console.log('renderTimeBasedChart - maxAmount:', maxAmount); // <--- Add this log

  // Thêm trục x
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 0);
  xAxis.setAttribute("y1", height);
  xAxis.setAttribute("x2", width);
  xAxis.setAttribute("y2", height);
  xAxis.setAttribute("stroke", "#333");
  xAxis.setAttribute("stroke-width", 2);
  g.appendChild(xAxis);

  // Thêm các đường kẻ ngang cho trục y
  for (let i = 0; i <= 5; i++) {
    const yPos = height - (i * height) / 5;
    const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    gridLine.setAttribute("x1", 0);
    gridLine.setAttribute("y1", yPos);
    gridLine.setAttribute("x2", width);
    gridLine.setAttribute("y2", yPos);
    gridLine.setAttribute("stroke", i === 0 ? "#333" : "#ddd");
    gridLine.setAttribute("stroke-width", i === 0 ? 2 : 1);
    g.appendChild(gridLine);

    // Thêm nhãn giá trị cho trục y
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", -10);
    yLabel.setAttribute("y", yPos + 5);
    yLabel.setAttribute("text-anchor", "end");
    yLabel.setAttribute("font-family", "Arial");
    yLabel.setAttribute("font-size", "12");
    yLabel.textContent = ((maxAmount * i) / 5 / 1000000).toFixed(2);
    g.appendChild(yLabel);
  }

  // Thêm nhãn cho trục y
  const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yAxisLabel.setAttribute("transform", "rotate(-90)");
  yAxisLabel.setAttribute("x", -height / 2);
  yAxisLabel.setAttribute("y", -60);
  yAxisLabel.setAttribute("text-anchor", "middle");
  yAxisLabel.setAttribute("font-family", "Arial");
  yAxisLabel.setAttribute("font-size", "14");
  yAxisLabel.textContent = "Doanh thu (Triệu VND)";
  g.appendChild(yAxisLabel);

  // Tính toán độ rộng của mỗi cột
  const barWidth = (width / sortedDates.length) * 0.7;
  const barSpacing = width / sortedDates.length;

  // Thêm các cột và nhãn
  sortedDates.forEach((date, index) => {
    const x = index * barSpacing + (barSpacing - barWidth) / 2;
    // Điều chỉnh cách tính barHeight để xử lý trường hợp maxAmount là 0 hoặc rất nhỏ
    const barHeight = maxAmount > 0 ? (dailyData[date].totalAmount / maxAmount) * height : height; // Nếu maxAmount là 0, dùng full height
    const barY = height - barHeight;

    // Tạo gradient cho cột
    const gradientId = `barGradient${index}`;
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", gradientId);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");

    // Thêm stop cho gradient
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", "stop-color:#4CAF50;stop-opacity:1");
    gradient.appendChild(stop1);

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("style", "stop-color:#388E3C;stop-opacity:1");
    gradient.appendChild(stop2);

    // Thêm gradient vào defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Tạo cột
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", x.toString());
    bar.setAttribute("y", barY.toString());
    bar.setAttribute("width", barWidth.toString());
    bar.setAttribute("height", barHeight.toString());
    bar.setAttribute("rx", "4");
    bar.setAttribute("fill", `url(#${gradientId})`);
    g.appendChild(bar);

    // Thêm nhãn cho cột (giá trị)
    const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valueLabel.setAttribute("x", (x + barWidth / 2).toString());
    valueLabel.setAttribute("y", (barY - 5).toString());
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.setAttribute("font-family", "Arial");
    valueLabel.setAttribute("font-size", "12");
    valueLabel.setAttribute("font-weight", "bold");
    valueLabel.textContent = formatCurrency(dailyData[date].totalAmount);
    g.appendChild(valueLabel);

    // Thêm nhãn cho cột (ngày)
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", (x + barWidth / 2).toString());
    label.setAttribute("y", (height + 20).toString());
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "Arial");
    label.setAttribute("font-size", "12");
    label.textContent = formatDate(moment(date));
    g.appendChild(label);
  });
}

/**
 * Vẽ biểu đồ theo sản phẩm
 */
function renderProductBasedChart(data, dataType) {
  const chartGrid = document.querySelector('.chart-grid');
  if (!chartGrid) return;

  // Xóa nội dung cũ
  chartGrid.innerHTML = '';

  // Tạo element SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 800 400");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  chartGrid.appendChild(svg);

  // Các thông số của biểu đồ
  const margin = { top: 40, right: 30, bottom: 60, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Tạo group chính
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Nhóm dữ liệu theo sản phẩm
  const productData = {};
  
  if (dataType === "ban-hang" && data.invoices) {
    data.invoices.forEach(invoice => {
      if (invoice.status === "Hoàn thành") {
        invoice.items.forEach(item => {
          if (!productData[item.name]) {
            productData[item.name] = {
              totalAmount: 0,
              quantity: 0
            };
          }
          productData[item.name].totalAmount += item.quantity * item.price;
          productData[item.name].quantity += item.quantity;
        });
      }
    });
  } else if (dataType === "nhap-hang" && data.purchases) {
    data.purchases.forEach(purchase => {
      // if (purchase.status === "Đã nhập") { // <--- Old condition
      // Kiểm tra trạng thái bằng cách tìm từ "nhập" (không phân biệt hoa thường, bỏ khoảng trắng)
      const dbStatusClean = purchase.status ? purchase.status.trim().toLowerCase() : '';
      const targetKeyword = "nhập";

      console.log(`renderProductBasedChart - Cleaned DB Status: '${dbStatusClean}', Target Keyword: '${targetKeyword}', Includes Keyword: ${dbStatusClean.includes(targetKeyword)}`); // <--- Add this log

      if (dbStatusClean.includes(targetKeyword)) { // <--- Changed this condition
        purchase.items.forEach(item => {
          if (!productData[item.name]) {
            productData[item.name] = {
              totalAmount: 0,
              quantity: 0
            };
          }
          productData[item.name].totalAmount += item.quantity * item.price;
          productData[item.name].quantity += item.quantity;
        });
      }
    });
  }

  // Sắp xếp sản phẩm theo tổng doanh thu
  const sortedProducts = Object.entries(productData)
    .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
    .slice(0, 10); // Chỉ hiển thị top 10 sản phẩm

  if (sortedProducts.length === 0) {
    chartGrid.innerHTML = '<div class="no-data">Không có dữ liệu</div>';
    return;
  }

  const maxAmount = Math.max(...sortedProducts.map(([, data]) => data.totalAmount));

  // Thêm trục x
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 0);
  xAxis.setAttribute("y1", height);
  xAxis.setAttribute("x2", width);
  xAxis.setAttribute("y2", height);
  xAxis.setAttribute("stroke", "#333");
  xAxis.setAttribute("stroke-width", 2);
  g.appendChild(xAxis);

  // Thêm các đường kẻ ngang cho trục y
  for (let i = 0; i <= 5; i++) {
    const yPos = height - (i * height) / 5;
    const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    gridLine.setAttribute("x1", 0);
    gridLine.setAttribute("y1", yPos);
    gridLine.setAttribute("x2", width);
    gridLine.setAttribute("y2", yPos);
    gridLine.setAttribute("stroke", i === 0 ? "#333" : "#ddd");
    gridLine.setAttribute("stroke-width", i === 0 ? 2 : 1);
    g.appendChild(gridLine);

    // Thêm nhãn giá trị cho trục y
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", -10);
    yLabel.setAttribute("y", yPos + 5);
    yLabel.setAttribute("text-anchor", "end");
    yLabel.setAttribute("font-family", "Arial");
    yLabel.setAttribute("font-size", "12");
    yLabel.textContent = ((maxAmount * i) / 5 / 1000000).toFixed(2);
    g.appendChild(yLabel);
  }

  // Thêm nhãn cho trục y
  const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yAxisLabel.setAttribute("transform", "rotate(-90)");
  yAxisLabel.setAttribute("x", -height / 2);
  yAxisLabel.setAttribute("y", -60);
  yAxisLabel.setAttribute("text-anchor", "middle");
  yAxisLabel.setAttribute("font-family", "Arial");
  yAxisLabel.setAttribute("font-size", "14");
  yAxisLabel.textContent = "Doanh thu (Triệu VND)";
  g.appendChild(yAxisLabel);

  // Tính toán độ rộng của mỗi cột
  const barWidth = (width / sortedProducts.length) * 0.7;
  const barSpacing = width / sortedProducts.length;

  // Thêm các cột và nhãn
  sortedProducts.forEach(([product, data], index) => {
    const x = index * barSpacing + (barSpacing - barWidth) / 2;
    const barHeight = (data.totalAmount / maxAmount) * height;
    const barY = height - barHeight;

    // Tạo gradient cho cột
    const gradientId = `barGradient${index}`;
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", gradientId);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");

    // Thêm stop cho gradient
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", "stop-color:#2196F3;stop-opacity:1");
    gradient.appendChild(stop1);

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("style", "stop-color:#1976D2;stop-opacity:1");
    gradient.appendChild(stop2);

    // Thêm gradient vào defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Tạo cột
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", x.toString());
    bar.setAttribute("y", barY.toString());
    bar.setAttribute("width", barWidth.toString());
    bar.setAttribute("height", barHeight.toString());
    bar.setAttribute("rx", "4");
    bar.setAttribute("fill", `url(#${gradientId})`);
    g.appendChild(bar);

    // Thêm nhãn cho cột (giá trị)
    const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valueLabel.setAttribute("x", (x + barWidth / 2).toString());
    valueLabel.setAttribute("y", (barY - 5).toString());
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.setAttribute("font-family", "Arial");
    valueLabel.setAttribute("font-size", "12");
    valueLabel.setAttribute("font-weight", "bold");
    valueLabel.textContent = formatCurrency(data.totalAmount);
    g.appendChild(valueLabel);

    // Thêm nhãn cho cột (tên sản phẩm)
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", (x + barWidth / 2).toString());
    label.setAttribute("y", (height + 20).toString());
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "Arial");
    label.setAttribute("font-size", "12");
    label.textContent = product;
    g.appendChild(label);
  });
}


/**
 * Vẽ biểu đồ theo nhân viên
 */
function renderEmployeeBasedChart(data, dataType) {
  const chartGrid = document.querySelector('.chart-grid');
  if (!chartGrid) return;

  // Xóa nội dung cũ
  chartGrid.innerHTML = '';

  // Tạo element SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 800 400");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  chartGrid.appendChild(svg);

  // Các thông số của biểu đồ
  const margin = { top: 40, right: 30, bottom: 60, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Tạo group chính
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Nhóm dữ liệu theo nhân viên
  const employeeData = {};
  
  if (dataType === "ban-hang" && data.invoices) {
    data.invoices.forEach(invoice => {
      if (invoice.status === "Hoàn thành") {
        if (!employeeData[invoice.employee_code]) {
          employeeData[invoice.employee_code] = {
            totalAmount: 0,
            count: 0
          };
        }
        employeeData[invoice.employee_code].totalAmount += invoice.totalAmount;
        employeeData[invoice.employee_code].count++;
      }
    });
  } else if (dataType === "nhap-hang" && data.purchases) {
    data.purchases.forEach(purchase => {
      if (purchase.status === "Đã nhập") {
        if (!employeeData[purchase.employee_code]) {
          employeeData[purchase.employee_code] = {
            totalAmount: 0,
            count: 0
          };
        }
        employeeData[purchase.employee_code].totalAmount += purchase.totalAmount;
        employeeData[purchase.employee_code].count++;
      }
    });
  }

  // Sắp xếp nhân viên theo tổng doanh thu
  const sortedEmployees = Object.entries(employeeData)
    .sort(([, a], [, b]) => b.totalAmount - a.totalAmount);

  if (sortedEmployees.length === 0) {
    chartGrid.innerHTML = '<div class="no-data">Không có dữ liệu</div>';
    return;
  }

  const maxAmount = Math.max(...sortedEmployees.map(([, data]) => data.totalAmount));

  // Thêm trục x
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 0);
  xAxis.setAttribute("y1", height);
  xAxis.setAttribute("x2", width);
  xAxis.setAttribute("y2", height);
  xAxis.setAttribute("stroke", "#333");
  xAxis.setAttribute("stroke-width", 2);
  g.appendChild(xAxis);

  // Thêm các đường kẻ ngang cho trục y
  for (let i = 0; i <= 5; i++) {
    const yPos = height - (i * height) / 5;
    const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    gridLine.setAttribute("x1", 0);
    gridLine.setAttribute("y1", yPos);
    gridLine.setAttribute("x2", width);
    gridLine.setAttribute("y2", yPos);
    gridLine.setAttribute("stroke", i === 0 ? "#333" : "#ddd");
    gridLine.setAttribute("stroke-width", i === 0 ? 2 : 1);
    g.appendChild(gridLine);

    // Thêm nhãn giá trị cho trục y
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", -10);
    yLabel.setAttribute("y", yPos + 5);
    yLabel.setAttribute("text-anchor", "end");
    yLabel.setAttribute("font-family", "Arial");
    yLabel.setAttribute("font-size", "12");
    yLabel.textContent = ((maxAmount * i) / 5 / 1000000).toFixed(2);
    g.appendChild(yLabel);
  }

  // Thêm nhãn cho trục y
  const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yAxisLabel.setAttribute("transform", "rotate(-90)");
  yAxisLabel.setAttribute("x", -height / 2);
  yAxisLabel.setAttribute("y", -60);
  yAxisLabel.setAttribute("text-anchor", "middle");
  yAxisLabel.setAttribute("font-family", "Arial");
  yAxisLabel.setAttribute("font-size", "14");
  yAxisLabel.textContent = "Doanh thu (Triệu VND)";
  g.appendChild(yAxisLabel);

  // Tính toán độ rộng của mỗi cột
  const barWidth = (width / sortedEmployees.length) * 0.7;
  const barSpacing = width / sortedEmployees.length;

  // Thêm các cột và nhãn
  sortedEmployees.forEach(([employee, data], index) => {
    const x = index * barSpacing + (barSpacing - barWidth) / 2;
    const barHeight = (data.totalAmount / maxAmount) * height;
    const barY = height - barHeight;

    // Tạo gradient cho cột
    const gradientId = `barGradient${index}`;
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", gradientId);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");

    // Thêm stop cho gradient
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", "stop-color:#FF9800;stop-opacity:1");
    gradient.appendChild(stop1);

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("style", "stop-color:#F57C00;stop-opacity:1");
    gradient.appendChild(stop2);

    // Thêm gradient vào defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Tạo cột
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", x.toString());
    bar.setAttribute("y", barY.toString());
    bar.setAttribute("width", barWidth.toString());
    bar.setAttribute("height", barHeight.toString());
    bar.setAttribute("rx", "4");
    bar.setAttribute("fill", `url(#${gradientId})`);
    g.appendChild(bar);

    // Thêm nhãn cho cột (giá trị)
    const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valueLabel.setAttribute("x", (x + barWidth / 2).toString());
    valueLabel.setAttribute("y", (barY - 5).toString());
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.setAttribute("font-family", "Arial");
    valueLabel.setAttribute("font-size", "12");
    valueLabel.setAttribute("font-weight", "bold");
    valueLabel.textContent = formatCurrency(data.totalAmount);
    g.appendChild(valueLabel);

    // Thêm nhãn cho cột (mã nhân viên)
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", (x + barWidth / 2).toString());
    label.setAttribute("y", (height + 20).toString());
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "Arial");
    label.setAttribute("font-size", "12");
    label.textContent = `NV${employee}`;
    g.appendChild(label);
  });
}

/**
 * Cập nhật summary grid
 * @param {Object} data - Dữ liệu doanh thu
 */
function updateSummaryGrid(data) {
  const summaryItems = document.querySelectorAll('.summary-item .summary-value');
  if (!summaryItems || summaryItems.length !== 7) return;

  // Tính toán các giá trị từ dữ liệu
  let totalAmount = 0;
  let totalDiscount = 0;
  let totalRevenue = 0;
  let totalDebt = 0;
  let actualRevenue = 0;
  let totalInvoices = 0;
  let totalItems = 0;

  // Tính toán cho hóa đơn bán hàng
  if (data.invoices) {
    data.invoices.forEach(invoice => {
      if (invoice.status === "Hoàn thành") {
        totalAmount += invoice.totalAmount;
        totalDiscount += invoice.discount || 0;
        totalRevenue += invoice.totalAmount - (invoice.discount || 0);
        actualRevenue += invoice.totalAmount - (invoice.discount || 0);
        totalInvoices++;
        totalItems += invoice.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    });
  }

  // Tính toán cho phiếu nhập hàng
  if (data.purchases) {
    data.purchases.forEach(purchase => {
      if (purchase.status === "Đã nhập") {
        totalDebt += purchase.totalAmount - purchase.paidAmount;
        actualRevenue -= (purchase.totalAmount - purchase.paidAmount);
      }
    });
  }

  // Cập nhật các giá trị trong summary grid
  summaryItems[0].textContent = formatCurrency(totalAmount);
  summaryItems[1].textContent = formatCurrency(totalDiscount);
  summaryItems[2].textContent = formatCurrency(totalRevenue);
  summaryItems[3].textContent = formatCurrency(totalDebt);
  summaryItems[4].textContent = formatCurrency(actualRevenue);
  summaryItems[5].textContent = totalInvoices;
  summaryItems[6].textContent = totalItems;
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
  // Kiểm tra và xử lý giá trị đầu vào
  if (!hex || typeof hex !== 'string') {
    return '#000000'; // Trả về màu đen nếu không có màu hợp lệ
  }

  // Đảm bảo hex có dạng #RRGGBB
  hex = hex.replace(/^#/, '');
  if (hex.length !== 6) {
    return '#000000';
  }

  try {
    // Chuyển đổi hex sang rgb
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Kiểm tra giá trị rgb hợp lệ
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return '#000000';
    }

    // Làm tối các giá trị
    r = Math.max(0, Math.floor((r * (100 - percent)) / 100));
    g = Math.max(0, Math.floor((g * (100 - percent)) / 100));
    b = Math.max(0, Math.floor((b * (100 - percent)) / 100));

    // Chuyển đổi trở lại hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch (error) {
    console.error('Error in darkenColor:', error);
    return '#000000';
  }
}

/**
 * Nhóm dữ liệu theo ngày
 * @param {Object} data - Dữ liệu đã lọc
 * @returns {Object} Dữ liệu đã nhóm theo ngày
 */
function groupDataByDate(data) {
  const dailyData = {};
  
  data.invoices.forEach(invoice => {
    if (invoice.status === "Hoàn thành") {
      const date = moment(invoice.time).format("YYYY-MM-DD");
      if (!dailyData[date]) {
        dailyData[date] = {
          totalAmount: 0,
          discount: 0,
          promotion: 0,
          revenue: 0,
          debt: 0,
          actualRevenue: 0,
          invoiceCount: 0
        };
      }
      dailyData[date].totalAmount += invoice.totalAmount;
      dailyData[date].revenue += invoice.totalAmount;
      dailyData[date].actualRevenue += invoice.totalAmount;
      dailyData[date].invoiceCount++;
    }
  });

  return dailyData;
}

/**
 * Cập nhật bảng dữ liệu chi tiết
 */
function updateDataTables(dataType, reportType, data) {
  console.log('updateDataTables received data:', data); // Log data here
  const detailTable = document.querySelector('.data-section:last-child .data-table table tbody');
  if (!detailTable) return;
  detailTable.innerHTML = '';

  // Cập nhật tiêu đề cột của bảng chi tiết
  let detailTableHeaders = [];
  if (dataType === "ban-hang") {
      detailTableHeaders = [
          'Mã', 'Thời gian', 'Tên KH/NCC', 'SĐT', 'Tổng tiền', 
          'Trạng thái', 'Loại', 'Thanh toán', 'Mã NV', 'Sản phẩm'
      ];
       // Cập nhật tiêu đề bảng chi tiết
      const detailHeader = document.querySelector('.data-section:last-child h3');
       if (detailHeader) detailHeader.textContent = "Thông tin chi tiết bán hàng";


  } else if (dataType === "nhap-hang") {
      detailTableHeaders = [
          'Mã', 'Thời gian', 'Tên NCC', 'Tổng tiền nhập', 'Trạng thái', 'Sản phẩm'
      ];
       // Cập nhật tiêu đề bảng chi tiết
      const detailHeader = document.querySelector('.data-section:last-child h3');
       if (detailHeader) detailHeader.textContent = "Thông tin chi tiết nhập hàng";


  } else {
       detailTableHeaders = [
          'Mã', 'Thời gian', 'Tên KH/NCC', 'SĐT', 'Tổng tiền', 
          'Trạng thái', 'Loại', 'Thanh toán', 'Mã NV', 'Sản phẩm'
      ];
       // Cập nhật tiêu đề bảng chi tiết
      const detailHeader = document.querySelector('.data-section:last-child h3');
       if (detailHeader) detailHeader.textContent = "Thông tin chi tiết";
  }

  const detailTableThead = document.querySelector('.data-section:last-child .data-table thead tr');
   if (detailTableThead) {
      detailTableThead.innerHTML = detailTableHeaders.map(header => `<th>${header}</th>`).join('');
   }

  // Gom nhóm và render dữ liệu
  let rows = [];
  if (dataType === "ban-hang" && data.invoices.length > 0) {
    data.invoices.forEach(invoice => {
      const invoiceDate = moment(invoice.time); // invoice.time phải là chuỗi ngày hợp lệ
      if (!invoiceDate.isValid()) {
        console.log('Ngày không hợp lệ:', invoice.time);
      }
      rows.push(`
        <tr>
          <td>${invoice.code}</td>
          <td>${formatDate(moment(invoice.time))}</td>
          <td>${invoice.customerName || ''}</td>
          <td>${invoice.phone || ''}</td>
          <td>${formatCurrency(invoice.totalAmount)}</td>
          <td>${invoice.status}</td>
          <td>${invoice.type}</td>
          <td>${invoice.paymentMethod || ''}</td>
          <td>${invoice.employee_code || ''}</td>
          <td>${invoice.items.map(i => i.name + ' x' + i.quantity).join('<br>')}</td>
        </tr>
      `);
    });
  } else if (dataType === "nhap-hang" && data.purchases.length > 0) {
    data.purchases.forEach(purchase => {
      rows.push(`
        <tr>
          <td>${purchase.code}</td>
          <td>${formatDate(moment(purchase.time))}</td>
          <td>${purchase.supplierName || ''}</td>
          <td>${formatCurrency(purchase.totalAmount)}</td>
          <td>${purchase.status}</td>
          <td>${purchase.items.map(i => i.name + ' x' + i.quantity).join('<br>')}</td>
        </tr>
      `);
    });
  }
  if (rows.length === 0) {
    detailTable.innerHTML = '<tr><td colspan="10" class="no-data">Không có dữ liệu</td></tr>';
  } else {
    detailTable.innerHTML = rows.join('');
  }
}

function showRevenueTableByType(reportType) {
  document.querySelector('.revenue-table-time').style.display = reportType === 'theo-thoi-gian' ? '' : 'none';
  document.querySelector('.revenue-table-product').style.display = reportType === 'theo-san-pham' ? '' : 'none';
  document.querySelector('.revenue-table-employee').style.display = reportType === 'theo-nhan-vien' ? '' : 'none';
}

function updateRevenueTableByType(data, dataType, reportType) {
  console.log('updateRevenueTableByType received data:', data); // Log data here
  showRevenueTableByType(reportType);

  let tableSelector = '';
  if (reportType === 'theo-thoi-gian') tableSelector = '.revenue-table-time';
  else if (reportType === 'theo-san-pham') tableSelector = '.revenue-table-product';
  else if (reportType === 'theo-nhan-vien') tableSelector = '.revenue-table-employee';

  const tableSection = document.querySelector(tableSelector);
  const table = tableSection ? tableSection.querySelector('.data-table table') : null;
  const tbody = table ? table.querySelector('tbody') : null;
  const thead = table ? table.querySelector('thead tr') : null;
  const h3 = tableSection ? tableSection.querySelector('h3') : null;
  if (!tbody || !thead || !h3) return;
  tbody.innerHTML = '';

  // Đặt tiêu đề cột 1 theo loại thống kê, cột 2 theo loại dữ liệu
  let col1 = 'Nhóm';
  if (reportType === 'theo-thoi-gian') col1 = 'Thời gian';
  else if (reportType === 'theo-san-pham') col1 = 'Sản phẩm';
  else if (reportType === 'theo-nhan-vien') col1 = 'Nhân viên';

  let col2 = 'Tổng';
  if (dataType === 'ban-hang') col2 = 'Doanh thu bán hàng';
  else if (dataType === 'nhap-hang') col2 = 'Tổng nhập hàng';

  thead.innerHTML = `<th>${col1}</th><th>${col2}</th>`;

  // Đặt tiêu đề bảng (h3)
  let title = '';
  if (dataType === 'ban-hang' && reportType === 'theo-thoi-gian') title = 'Doanh thu bán hàng theo thời gian';
  else if (dataType === 'nhap-hang' && reportType === 'theo-thoi-gian') title = 'Doanh thu nhập hàng theo thời gian';
  else if (dataType === 'ban-hang' && reportType === 'theo-san-pham') title = 'Doanh thu bán hàng theo sản phẩm';
  else if (dataType === 'nhap-hang' && reportType === 'theo-san-pham') title = 'Doanh thu nhập hàng theo sản phẩm';
  else if (dataType === 'ban-hang' && reportType === 'theo-nhan-vien') title = 'Doanh thu bán hàng theo nhân viên';
  else if (dataType === 'nhap-hang' && reportType === 'theo-nhan-vien') title = 'Doanh thu nhập hàng theo nhân viên';
  else title = 'Doanh thu';
  h3.textContent = title;

  // Gom nhóm và render dữ liệu
  let groupMap = {};
  if (reportType === 'theo-thoi-gian') {
    if (dataType === 'ban-hang' && data.invoices) {
      data.invoices.forEach(inv => {
        const date = moment(inv.time).format('YYYY-MM-DD');
        if (!groupMap[date]) groupMap[date] = 0;
        groupMap[date] += inv.totalAmount;
      });
    } else if (dataType === 'nhap-hang' && data.purchases) {
      data.purchases.forEach(pur => {
        const date = moment(pur.time).format('YYYY-MM-DD');
        if (!groupMap[date]) groupMap[date] = 0;
        groupMap[date] += pur.totalAmount;
      });
    }
  } else if (reportType === 'theo-san-pham') {
    if (dataType === 'ban-hang' && data.invoices) {
      data.invoices.forEach(inv => {
        inv.items.forEach(item => {
          if (!groupMap[item.name]) groupMap[item.name] = 0;
          groupMap[item.name] += item.quantity * item.price;
        });
      });
    } else if (dataType === 'nhap-hang' && data.purchases) {
      data.purchases.forEach(pur => {
        pur.items.forEach(item => {
          if (!groupMap[item.name]) groupMap[item.name] = 0;
          groupMap[item.name] += item.quantity * item.price;
        });
      });
    }
  } else if (reportType === 'theo-nhan-vien') {
    if (dataType === 'ban-hang' && data.invoices) {
      data.invoices.forEach(inv => {
        const code = inv.employee_code || '';
        if (!groupMap[code]) groupMap[code] = 0;
        groupMap[code] += inv.totalAmount;
      });
    } else if (dataType === 'nhap-hang' && data.purchases) {
      data.purchases.forEach(pur => {
        const code = pur.employee_code || '';
        if (!groupMap[code]) groupMap[code] = 0;
        groupMap[code] += pur.totalAmount;
      });
    }
  }

  const rows = Object.entries(groupMap)
    .sort()
    .map(([group, value]) => `
      <tr>
        <td>${reportType === 'theo-thoi-gian' ? formatDate(moment(group)) : group}</td>
        <td>${formatCurrency(value)}</td>
      </tr>
    `);
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="no-data">Không có dữ liệu</td></tr>';
  } else {
    tbody.innerHTML = rows.join('');
  }
}
