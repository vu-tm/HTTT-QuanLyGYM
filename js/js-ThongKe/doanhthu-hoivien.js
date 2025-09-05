$(document).ready(function () {
  // === Khởi tạo biến và thư viện ===

  // Tính toán ngày mặc định: từ ngày đầu tiên của tuần trước đến ngày hiện tại
  const startOfLastWeek = moment().subtract(1, "weeks").startOf("week");
  const today = moment();

  // Biến kiểm tra trạng thái tải Chart.js
  let chartJsLoaded = false;

  // Thêm Font Awesome
  $("<link>")
    .attr({
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
    })
    .appendTo("head");

  // Thêm Chart.js
  $("<script>")
    .attr({
      src: "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js",
    })
    .on("load", function () {
      chartJsLoaded = true;
      console.log("Chart.js loaded");
    })
    .appendTo("head");

  // Thêm thư viện SheetJS
  $("<script>")
    .attr({
      src: "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js",
    })
    .appendTo("head");

  // === Khởi tạo DateRangePicker ===

  $(".date-picker input").daterangepicker({
    startDate: startOfLastWeek,
    endDate: today,
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
      "Tuần trước": [
        moment().subtract(1, "weeks").startOf("week"),
        moment().subtract(1, "weeks").endOf("week"),
      ],
      "Tháng này": [moment().startOf("month"), moment().endOf("month")],
      "Tháng trước": [
        moment().subtract(1, "month").startOf("month"),
        moment().subtract(1, "month").endOf("month"),
      ],
    },
    alwaysShowCalendars: true,
    linkedCalendars: false,
  });

  // Đặt giá trị ban đầu cho input DateRangePicker
  $(".date-picker input").val(
    startOfLastWeek.format("DD/MM/YYYY") + " - " + today.format("DD/MM/YYYY")
  );

  // === Thêm CSS tùy chỉnh ===

  $("<style>")
    .prop("type", "text/css")
    .html(
      `
      /* CSS cho DateRangePicker */
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

      /* CSS cho biểu đồ */
      .chart-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px;
      }
      .chart-card {
        background: white;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        height: 300px; /* Giảm chiều cao xuống */
      }
      .chart-card canvas {
        max-height: 250px !important; /* Giới hạn chiều cao của canvas */
      }
      `
    )
    .appendTo("head");

  // === Xử lý sự kiện ===

  // Xử lý sự kiện khi thay đổi khoảng thời gian
  $(".date-picker input").on("apply.daterangepicker", function (ev, picker) {
    const startDate = picker.startDate.format("YYYY-MM-DD");
    const endDate = picker.endDate.format("YYYY-MM-DD");
    updateDataBasedOnFilters(startDate, endDate);
  });

  // Xử lý sự kiện khi thay đổi loại dữ liệu
  $('input[name="dataType"]').change(function () {
    const startDate = $(".date-picker input")
      .data("daterangepicker")
      .startDate.format("YYYY-MM-DD");
    const endDate = $(".date-picker input")
      .data("daterangepicker")
      .endDate.format("YYYY-MM-DD");
    updateDataBasedOnFilters(startDate, endDate);
  });

  // Xử lý sự kiện khi thay đổi loại thống kê
  $('input[name="statsType"]').change(function () {
    const startDate = $(".date-picker input")
      .data("daterangepicker")
      .startDate.format("YYYY-MM-DD");
    const endDate = $(".date-picker input")
      .data("daterangepicker")
      .endDate.format("YYYY-MM-DD");
    updateDataBasedOnFilters(startDate, endDate);
  });

  // Xử lý sự kiện khi thay đổi loại thống kê gói
  $('input[name="packageStatsType"]').change(function () {
    const startDate = $(".date-picker input")
      .data("daterangepicker")
      .startDate.format("YYYY-MM-DD");
    const endDate = $(".date-picker input")
      .data("daterangepicker")
      .endDate.format("YYYY-MM-DD");
    updateDataBasedOnFilters(startDate, endDate);
  });

  // === Hàm cập nhật dữ liệu ===

  async function updateDataBasedOnFilters(startDate, endDate) {
    try {
      // Lấy các điều kiện lọc
      const dataType = $('input[name="dataType"]:checked').attr('id'); // 'member' hoặc 'revenue'
      const statsType = $('input[name="statsType"]:checked').attr('id'); // 'byTime', 'byPackage', 'byStaff', 'bySales'
      const packageStatsType = $('input[name="packageStatsType"]:checked').attr('id'); // 'newReg' hoặc 'all'

      console.log('Fetching data with filters:', { startDate, endDate, dataType, statsType, packageStatsType });

      let processedData = {
        registrations: [],
        details: []
      };

      // Fetch data based on statistics type
      switch(statsType) {
        case 'byTime':
          const registrationsResponse = await fetch(`http://localhost:5000/api/customer-registrations?startDate=${startDate}&endDate=${endDate}`);
          const registrations = await registrationsResponse.json();
          
          // Group by date
          const registrationsByDate = {};
          registrations.forEach(reg => {
            const date = moment(reg.start_date).format('DD/MM/YYYY');
            if (!registrationsByDate[date]) {
              registrationsByDate[date] = {
                count: 0,
                revenue: 0
              };
            }
            registrationsByDate[date].count++;
            registrationsByDate[date].revenue += parseFloat(reg.package_price) || 0;
          });

          processedData.registrations = Object.entries(registrationsByDate).map(([date, data]) => ({
            date,
            newRegistrations: dataType === 'member' ? data.count : data.revenue
          }));

          // Process details
          processedData.details = registrations.map(reg => ({
            invoice: reg.registration_code,
            customerId: reg.customer_code,
            customerName: reg.customer_name,
            phone: reg.phone,
            package: reg.package_name,
            price: parseFloat(reg.package_price) || 0,
            startDate: moment(reg.start_date).format('DD/MM/YYYY'),
            endDate: moment(reg.end_date).format('DD/MM/YYYY'),
            type: packageStatsType,
            staffId: reg.employee_code || '',
            staffName: reg.employee_name || '',
            salesId: reg.employee_code || '',
            salesName: reg.employee_name || ''
          }));
          break;

        case 'byPackage':
          const packageResponse = await fetch(`http://localhost:5000/api/package-statistics?startDate=${startDate}&endDate=${endDate}`);
          const packageStats = await packageResponse.json();
          
          processedData.registrations = packageStats.map(stat => ({
            date: stat.package_name,
            newRegistrations: dataType === 'member' ? stat.registration_count : stat.total_revenue
          }));

          // Get detailed registrations for the table
          const packageRegistrations = await fetch(`http://localhost:5000/api/customer-registrations?startDate=${startDate}&endDate=${endDate}`);
          const packageDetails = await packageRegistrations.json();
          
          processedData.details = packageDetails.map(reg => ({
            invoice: reg.registration_code,
            customerId: reg.customer_code,
            customerName: reg.customer_name,
            phone: reg.phone,
            package: reg.package_name,
            price: parseFloat(reg.package_price) || 0,
            startDate: moment(reg.start_date).format('DD/MM/YYYY'),
            endDate: moment(reg.end_date).format('DD/MM/YYYY'),
            type: packageStatsType,
            staffId: reg.employee_code || '',
            staffName: reg.employee_name || '',
            salesId: reg.employee_code || '',
            salesName: reg.employee_name || ''
          }));
          break;

        case 'byStaff':
        case 'bySales':
          const employeeResponse = await fetch(`http://localhost:5000/api/employee-statistics?startDate=${startDate}&endDate=${endDate}`);
          const employeeStats = await employeeResponse.json();
          
          processedData.registrations = employeeStats.map(stat => ({
            date: stat.employee_name,
            newRegistrations: dataType === 'member' ? stat.registration_count : stat.total_revenue
          }));

          // Get detailed registrations for the table
          const employeeRegistrations = await fetch(`http://localhost:5000/api/customer-registrations?startDate=${startDate}&endDate=${endDate}`);
          const employeeDetails = await employeeRegistrations.json();
          
          processedData.details = employeeDetails.map(reg => ({
            invoice: reg.registration_code,
            customerId: reg.customer_code,
            customerName: reg.customer_name,
            phone: reg.phone,
            package: reg.package_name,
            price: parseFloat(reg.package_price) || 0,
            startDate: moment(reg.start_date).format('DD/MM/YYYY'),
            endDate: moment(reg.end_date).format('DD/MM/YYYY'),
            type: packageStatsType,
            staffId: reg.employee_code || '',
            staffName: reg.employee_name || '',
            salesId: reg.employee_code || '',
            salesName: reg.employee_name || ''
          }));
          break;
      }

      console.log('Processed data:', processedData);

      // Cập nhật UI
      updateUI(processedData, dataType);

      // Cập nhật biểu đồ
      updateCharts(startDate, endDate, dataType, statsType);

    } catch (error) {
      console.error('Error in updateDataBasedOnFilters:', error);
      showNotification('Lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
    }
  }

  function updateUI(data, dataType) {
    // Update registration summary
    const totalRegistrations = data.registrations.reduce((sum, reg) => sum + reg.newRegistrations, 0);
    $('.summary-value').text(dataType === 'member' ? totalRegistrations : totalRegistrations.toLocaleString('vi-VN') + ' VNĐ');

    // Update registration timeline table
    const timelineTable = $('.data-table').first();
    timelineTable.find('tbody').empty();
    
    if (data.registrations.length === 0) {
      timelineTable.find('tbody').append('<tr><td colspan="2" class="no-data">Không có dữ liệu</td></tr>');
    } else {
      data.registrations.forEach(reg => {
        timelineTable.find('tbody').append(`
          <tr>
            <td>${reg.date}</td>
            <td>${dataType === 'member' ? reg.newRegistrations : reg.newRegistrations.toLocaleString('vi-VN') + ' VNĐ'}</td>
          </tr>
        `);
      });
    }

    // Update detailed information table
    const detailsTable = $('.data-table').last();
    detailsTable.find('tbody').empty();

    if (data.details.length === 0) {
      detailsTable.find('tbody').append('<tr><td colspan="9" class="no-data">Không có dữ liệu</td></tr>');
    } else {
      data.details.forEach(detail => {
        detailsTable.find('tbody').append(`
          <tr>
            <td>${detail.invoice}</td>
            <td>${detail.customerId}</td>
            <td>${detail.customerName}</td>
            <td>${detail.phone}</td>
            <td>${detail.package}</td>
            <td>${detail.price.toLocaleString('vi-VN')} VNĐ</td>
            <td>${detail.startDate}</td>
            <td>${detail.endDate}</td>
            <td>
              <button class="action-btn" onclick="viewDetails('${detail.invoice}')">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        `);
      });
    }
  }

  async function updateCharts(startDate, endDate, dataType, statsType) {
    try {
      let chartData;

      switch(statsType) {
        case 'byTime':
          const registrationsResponse = await fetch(`http://localhost:5000/api/customer-registrations?startDate=${startDate}&endDate=${endDate}`);
          const registrations = await registrationsResponse.json();
          
          // Group by date
          const registrationsByDate = {};
          registrations.forEach(reg => {
            const date = moment(reg.start_date).format('DD/MM/YYYY');
            if (!registrationsByDate[date]) {
              registrationsByDate[date] = { count: 0, revenue: 0 };
            }
            registrationsByDate[date].count++;
            registrationsByDate[date].revenue += parseFloat(reg.package_price) || 0;
          });

          chartData = {
            labels: Object.keys(registrationsByDate),
            memberData: Object.values(registrationsByDate).map(data => data.count),
            revenueData: Object.values(registrationsByDate).map(data => data.revenue),
            colors: generateColors(Object.keys(registrationsByDate).length)
          };
          break;

        case 'byPackage':
          const packageResponse = await fetch(`http://localhost:5000/api/package-statistics?startDate=${startDate}&endDate=${endDate}`);
          const packageStats = await packageResponse.json();
          
          chartData = {
            labels: packageStats.map(stat => stat.package_name),
            memberData: packageStats.map(stat => stat.registration_count),
            revenueData: packageStats.map(stat => stat.total_revenue),
            colors: generateColors(packageStats.length)
          };
          break;

        case 'byStaff':
        case 'bySales':
          const employeeResponse = await fetch(`http://localhost:5000/api/employee-statistics?startDate=${startDate}&endDate=${endDate}`);
          const employeeStats = await employeeResponse.json();
          
          chartData = {
            labels: employeeStats.map(stat => stat.employee_name),
            memberData: employeeStats.map(stat => stat.registration_count),
            revenueData: employeeStats.map(stat => stat.total_revenue),
            colors: generateColors(employeeStats.length)
          };
          break;
      }

      // Draw charts
      drawChart('membersChart', chartData.labels, chartData.memberData, chartData.colors, 
        dataType === 'member' ? 'Số lượng hội viên' : 'Doanh thu (VNĐ)');
      drawChart('revenueChart', chartData.labels, chartData.revenueData, chartData.colors, 
        dataType === 'member' ? 'Số lượng hội viên' : 'Doanh thu (VNĐ)');

    } catch (error) {
      console.error('Error updating charts:', error);
      showNotification('Lỗi khi cập nhật biểu đồ. Vui lòng thử lại sau.');
    }
  }

  function drawChart(canvasId, labels, data, colors, yAxisLabel) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy existing chart if it exists
    if (window[canvasId + 'Chart']) {
      window[canvasId + 'Chart'].destroy();
    }

    // Create new chart
    window[canvasId + 'Chart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: yAxisLabel,
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.2', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Ẩn legend
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: yAxisLabel,
              font: {
                size: 12 // Giảm kích thước font
              }
            },
            ticks: {
              font: {
                size: 10 // Giảm kích thước font của số
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10 // Giảm kích thước font của nhãn
              },
              maxRotation: 45, // Xoay nhãn 45 độ
              minRotation: 45
            }
          }
        }
      }
    });
  }

  function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsla(${hue}, 70%, 50%, 0.2)`);
    }
    return colors;
  }

  function showNotification(message) {
    // Implement notification system
    alert(message);
  }

  // Initialize data on page load
  const initialStartDate = startOfLastWeek.format("YYYY-MM-DD");
  const initialEndDate = today.format("YYYY-MM-DD");
  updateDataBasedOnFilters(initialStartDate, initialEndDate);
});
