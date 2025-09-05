let currentSearch = {
  type: null, // 'hlv' hoặc 'status'
  status: null,
  keyword: ''
};
let currentStatus = null;
let currentKeyword = '';
$('#search-type').on('change', function () {
  const selected = $(this).val();

  // Reset hiển thị
  $('#search-hlv').hide();
  $('#search-status').hide();
  $('#hlv-search-input').hide();
  $('#selected-status-label').text('');

  if (selected === 'hlv') {
    $('#search-hlv').show();
    $('#hlv-search-input').show().focus().val(currentKeyword);
  } else if (selected === 'status') {
    $('#search-status').show();
  }
});

// Xử lý click chọn trạng thái
$('#selected-status-label').on('click', function (e) {
  e.stopPropagation();
  $('#search-status').toggle();
});

$('.status-option').on('click', function (e) {
  e.stopPropagation();
  const status = $(this).text().trim();

  // Toggle trạng thái nếu click lại
  currentStatus = currentStatus === status ? null : status;
  $('#selected-status-label').text(currentStatus || 'Chọn trạng thái');

  $('#search-status').hide();
  reloadTableData();
});

// Xử lý tìm kiếm HLV
$('#hlv-search-input').on('keypress', function(e) {
  if (e.which === 13) { // Mã phím Enter
    currentSearch.keyword = $(this).val().trim();
    console.log("Tìm theo HLV:", currentSearch.keyword);
    reloadData(); // Chỉ reload dữ liệu, không ẩn input
  }
});

// Xử lý click ra ngoài để ẩn input
$(document).on('click', function(e) {
  // Xử lý ẩn input HLV
  if (currentSearch.type === 'hlv') {
    const $hlvSearch = $('#search-hlv');
    const isClickInside = $hlvSearch.has(e.target).length > 0 || $(e.target).closest('#search-hlv').length > 0;
    
    if (!isClickInside) {
      $('#hlv-search-input').hide();
    }
  }
  
  // Xử lý ẩn dropdown trạng thái (giữ nguyên)
  if (currentSearch.type === 'status') {
    // ... logic hiện tại ...
  }
});



// ẩn loại lọc khi chọn option khác ngoài "chi tiết hội viên đăng kí"
$(document).ready(function () {
  function toggleFilterSection() {
    const selectedLabel = $('input[name="report"]:checked').next('span').text().trim();
    if (selectedLabel === 'Chi tiết hội viên đăng ký') {
      $('#filter-section').show();
    } else {
      $('#filter-section').hide();
    }
  }

  // Gọi khi thay đổi radio
  $('input[name="report"]').on('change', function () {
    toggleFilterSection();
  });

  // Gọi một lần khi trang tải xong
  toggleFilterSection();
});

// thay đổi tiêu đề tương ứng với option:
$(document).ready(function () {
  function updateTitleHeader() {
    const selectedText = $('input[name="report"]:checked').next('span').text().trim();
    $('.title_header').text(selectedText);
  }

  // Gọi khi radio thay đổi
  $('input[name="report"]').on('change', function () {
    updateTitleHeader();
  });

  // Gọi khi trang load để đảm bảo đúng tiêu đề ban đầu
  updateTitleHeader();
});






// cập nhật table khi thay đổi lựa chọn:
$(document).ready(function () {
  function updateRightContentByReport() {
    const selectedText = $('input[name="report"]:checked').next('span').text().trim();

    // Cập nhật tiêu đề
    $('#report-title').text(selectedText);

    // Cập nhật bảng tương ứng
    let newThead = '';

    switch (selectedText) {
      case 'Chi tiết hội viên đăng ký':
        newThead = `
          <tr>
            <th>STT</th>
            <th>Nhóm PT</th>
            <th>Khách hàng</th>
            <th>HLV</th>
            <th>Số buổi</th>
            <th>Còn lại</th>
            <th>Ngày hợp đồng</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Trạng thái</th>
            <th>PT</th>
            <th>Loại PT</th>
          </tr>`;
        break;

      case 'Tổng quan hội viên đăng ký':
        newThead = `
          <tr>
            <th>STT</th>
            <th>HLV</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Tổng đăng ký</th>
            <th>Tổng số huỷ</th>
          </tr>`;
        break;

      case 'Chi tiết lịch sử đi tập':
        newThead = `
          <tr>
            <th>STT</th>
            <th>Ngày tập</th>
            <th>Hội viên</th>
            <th>SĐT</th>
            <th>Gói dịch vụ</th>
            <th>Giá gói</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Trạng thái</th>
            <th>Huấn luyện viên</th>
          </tr>`;
        break;

      case 'Tổng hợp số buổi dạy':
        newThead = `
          <tr>
            <th>STT</th>
            <th>HLV</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Tổng số buổi</th>
            <th>Đã xác nhận</th>
            <th>Chưa xác nhận</th>
          </tr>`;
        break;

      case 'Tổng quan lương HLV':
        newThead = `
          <tr>
            <th>STT</th>
            <th>HLV</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Tổng ca dạy</th>
            <th>Tổng giờ</th>
            <th>Lương tổng</th>
          </tr>`;
        break;

      default:
        newThead = `<tr><th>STT</th><th>Thông tin</th></tr>`;
    }

    $('#report-table-head').html(newThead);
  }

  // Gọi khi thay đổi
  $('input[name="report"]').on('change', function () {
    updateRightContentByReport();
  });

  // Gọi lần đầu khi trang load
  updateRightContentByReport();
});


// xuất file Excel
$('.export-btn').on('click', function () {
  const table = document.querySelector('.table-container table');
  const title = $('#report-title').text().trim();

  // Kiểm tra dữ liệu
  if ($(table).find('tbody tr').length === 0 || $(table).find('.no-data').length > 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  // Chuẩn bị dữ liệu
  const ws = XLSX.utils.table_to_sheet(table);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");

  // Xuất file
  XLSX.writeFile(wb, `${title}_${moment().format('DDMMYYYY_HHmmss')}.xlsx`);
});

function loadPTSummary() {
  fetch('http://localhost:5000/api/pt-summary')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('.table-container tbody');
      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">Không tìm thấy bản ghi nào</td></tr>`;
        return;
      }
      tbody.innerHTML = data.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.hlv}</td>
          <td>${item.from ? item.from.split('T')[0] : ''}</td>
          <td>${item.to ? item.to.split('T')[0] : ''}</td>
          <td>${item.total}</td>
          <td>${item.canceled}</td>
        </tr>
      `).join('');
    });
}

function loadPTSessionsSummary() {
  fetch('http://localhost:5000/api/pt-sessions-summary')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('.table-container tbody');
      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data">Không tìm thấy bản ghi nào</td></tr>`;
        return;
      }
      tbody.innerHTML = data.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.hlv}</td>
          <td>${item.from ? item.from.split('T')[0] : ''}</td>
          <td>${item.to ? item.to.split('T')[0] : ''}</td>
          <td>${item.total}</td>
          <td>${item.confirmed}</td>
          <td>${item.unconfirmed}</td>
        </tr>
      `).join('');
    });
}

function loadPTSalarySummary() {
  fetch('http://localhost:5000/api/pt-salary-summary')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('.table-container tbody');
      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data">Không tìm thấy bản ghi nào</td></tr>`;
        return;
      }
      tbody.innerHTML = data.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.hlv}</td>
          <td>${item.from ? item.from.split('T')[0] : ''}</td>
          <td>${item.to ? item.to.split('T')[0] : ''}</td>
          <td>${item.sessions}</td>
          <td>${item.hours}</td>
          <td>${item.salary ? item.salary.toLocaleString('vi-VN') : 0}</td>
        </tr>
      `).join('');
    });
}

function reloadTableData() {
  const selected = $('input[name="report"]:checked').next('span').text().trim();
  if (selected === 'Tổng quan hội viên đăng ký') {
    loadPTSummary();
  } else if (selected === 'Tổng hợp số buổi dạy') {
    loadPTSessionsSummary();
  } else if (selected === 'Tổng quan lương HLV') {
    loadPTSalarySummary();
  }
}

// Gọi khi trang load và khi đổi loại báo cáo
$(document).ready(function () {
  reloadTableData();
  $('input[name="report"]').on('change', reloadTableData);
});