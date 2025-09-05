const weekHeader = document.getElementById("week-header");
const datePicker = document.getElementById("date-picker");

let currentDate = new Date(); // Ngày hiện tại
let currentFilterQuery = ""; // Biến lưu trữ trạng thái bộ lọc
let currentMemberFilter = ""; // Biến lưu trữ trạng thái bộ lọc khách hàng
let currentTrainerFilter = ""; // Biến lưu trữ trạng thái bộ lọc HLV
let currentStatusFilter = ""; // Biến lưu trữ trạng thái bộ lọc trạng thái
let allSchedules = [];

// Hàm tính toán ngày trong tuần
function getWeekDates(startDate) {
  const weekDates = [];
  const startOfWeek = new Date(startDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Thứ 2
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date);
  }
  return weekDates;
}

// Cập nhật tiêu đề bảng
function updateWeekHeader() {
  const weekHeader = document.getElementById("week-header");
  const weekDates = getWeekDates(currentDate); // Lấy danh sách ngày trong tuần
  let headerHTML = "<tr><th>Khung giờ</th>"; // Cột đầu tiên là "Khung giờ"

  weekDates.forEach((date) => {
    const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dayName = dayNames[date.getDay()]; // Lấy tên thứ
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`; // Định dạng ngày/tháng (dd/mm)
    headerHTML += `<th>${dayName}<br>${formattedDate}</th>`; // Thêm cột cho từng ngày
  });

  headerHTML += "</tr>";
  weekHeader.innerHTML = headerHTML; // Cập nhật nội dung của <thead>
}

// Xử lý sự kiện khi chọn ngày trong ô nhập ngày
if (datePicker) {
  datePicker.addEventListener("change", function () {
    const selectedDate = new Date(datePicker.value);
    if (!isNaN(selectedDate)) {
      currentDate = selectedDate; // Cập nhật ngày hiện tại
      updateWeekHeader(); // Cập nhật tiêu đề tuần
      fetchSchedules(); // Tải lại lịch tập cho tuần mới
    }
  });
}

// Đặt giá trị mặc định cho ô nhập ngày và hiển thị tuần hiện tại
datePicker.value = currentDate.toISOString().split("T")[0];
updateWeekHeader();

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("schedule-modal");
  const openModalBtn = document.getElementById("open-schedule-modal"); // Nút "Đặt lịch"
  const closeModalBtn = document.querySelector(".close-btn");
  const scheduleForm = document.getElementById("schedule-form");

  // Mở modal
  openModalBtn.addEventListener("click", async () => {
    modal.style.display = "block";
    await loadMembers();
    await loadTrainers();
  });

  // Đóng modal
  closeModalBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Đóng modal khi click ra ngoài
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Lấy danh sách thành viên
  async function fetchMembers() {
    const response = await fetch("http://localhost:5000/api/customers");
    const members = await response.json();
    const memberSelect = document.getElementById("customer-name");

    // Xóa các tùy chọn cũ
    memberSelect.innerHTML = '<option value="">--- Chọn thành viên ---</option>';

    members.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.code; // Sử dụng code thay vì MemberID
      option.textContent = member.name; // Sử dụng name thay vì Name
      memberSelect.appendChild(option);
    });
  }

  // Lưu lịch tập
  async function saveSchedule(schedule) {
    const response = await fetch("http://localhost:5000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    const message = await response.text();
    alert(message);
  }

  // Gọi API khi trang tải
  fetchMembers();

  // Xử lý lưu lịch tập
  document.getElementById("schedule-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const memberID = document.getElementById("customer-name").value;
    const trainerID = document.getElementById("trainer").value;
    const scheduleDate = document.getElementById("start-date").value;
    const startHour = document.getElementById("start-time").value;
    const duration = parseInt(document.getElementById("duration").value, 10);
    const status = document.getElementById("status").value;

    if (!memberID || !trainerID || !scheduleDate || startHour === "" || isNaN(duration)) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberID,
          trainerID,
          scheduleDate,
          startHour: parseInt(startHour, 10),
          duration,
          status,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        alert(`Lỗi: ${errorMessage}`);
        return;
      }

      alert("Lịch tập đã được lưu!");
      modal.style.display = "none";
      scheduleForm.reset();
      fetchSchedules();
    } catch (error) {
      console.error("Lỗi khi lưu lịch tập:", error);
    }
  });

  // Gửi request tìm kiếm HLV
  async function searchTrainers(query) {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/search?name=${query}`);
      const trainers = await response.json();

      // Hiển thị kết quả tìm kiếm
      const resultsContainer = document.getElementById("results");
      resultsContainer.innerHTML = ""; // Xóa kết quả cũ
      trainers.forEach((trainer) => {
        const trainerElement = document.createElement("div");
        trainerElement.textContent = `ID: ${trainer.TrainerID}, Name: ${trainer.Name}`; // Chỉ hiển thị ID và tên
        resultsContainer.appendChild(trainerElement);
      });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm HLV:", error);
    }
  }

  // Gửi request tìm kiếm khách hàng
  async function searchCustomers(query) {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/search?name=${query}`);
      const customers = await response.json();

      // Hiển thị gợi ý tìm kiếm
      const suggestionsList = document.getElementById("customer-suggestions");
      suggestionsList.innerHTML = ""; // Xóa gợi ý cũ

      if (customers.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "Không tìm thấy khách hàng";
        emptyItem.classList.add("empty");
        suggestionsList.appendChild(emptyItem);
      } else {
        customers.forEach((customer) => {
          const suggestionItem = document.createElement("li");
          suggestionItem.textContent = `${customer.name} (${customer.phone})`; // Sử dụng name và phone
          suggestionItem.dataset.memberId = customer.code; // Sử dụng code
          suggestionItem.dataset.phone = customer.phone;

          // Xử lý sự kiện khi chọn gợi ý
          suggestionItem.addEventListener("click", () => {
            document.getElementById("customer-name").value = customer.name;
            document.getElementById("phone-number").value = customer.phone;
            suggestionsList.innerHTML = "";
          });

          suggestionsList.appendChild(suggestionItem);
        });
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm khách hàng:", error);
    }
  }

  // Lắng nghe sự kiện nhập liệu
  document.getElementById("memberSearchInput").addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    const suggestionsList = document.getElementById("memberSuggestions");
    suggestionsList.innerHTML = "";

    if (query.length === 0) return;

    try {
      const response = await fetch(`http://localhost:5000/api/customers/search?name=${encodeURIComponent(query)}`);
      const members = await response.json();

      if (members.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Không tìm thấy khách hàng";
        li.classList.add("empty");
        suggestionsList.appendChild(li);
      } else {
        members.forEach((member) => {
          const li = document.createElement("li");
          li.textContent = member.name;
          li.addEventListener("click", () => {
            document.getElementById("memberSearchInput").value = member.name;
            suggestionsList.innerHTML = "";
            // Lọc bảng theo tên khách hàng
            filterSchedulesByMember(member.name.toLowerCase());
          });
          suggestionsList.appendChild(li);
        });
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm khách hàng:", error);
    }
  });

  // Khi nhập vào input, cũng lọc bảng theo giá trị hiện tại
  document.getElementById("memberSearchInput").addEventListener("input", (event) => {
    filterSchedulesByMember(event.target.value.trim().toLowerCase());
  });

  // Lắng nghe sự kiện tìm kiếm khách hàng
  document.querySelector("input[placeholder='Tên khách hàng, SĐT']").addEventListener("input", (event) => {
    const query = event.target.value;
    searchCustomers(query);
  });

  // Lắng nghe sự kiện tìm kiếm thành viên
  document.getElementById("memberSearchButton").addEventListener("click", () => {
    const query = document.getElementById("memberSearchInput").value;
    searchCustomers(query);
  });

  // Gửi request tìm kiếm khách hàng trong modal
  async function searchMembersInModal(query) {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/search?name=${query}`);
      const members = await response.json();

      // Hiển thị kết quả tìm kiếm trong dropdown
      const customerDropdown = document.getElementById("customer-name");
      customerDropdown.innerHTML = ""; // Xóa kết quả cũ
      members.forEach((member) => {
        const option = document.createElement("option");
        option.value = member.MemberID;
        option.textContent = `${member.Name} (${member.Phone})`;
        customerDropdown.appendChild(option);
      });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm khách hàng trong modal:", error);
    }
  }

  // Lắng nghe sự kiện tìm kiếm trong modal
  document.getElementById("customer-name").addEventListener("input", (event) => {
    const query = event.target.value;
    searchMembersInModal(query);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  updateWeekHeader(); // Hiển thị ngày trong tuần
  fetchSchedules(); // Tải danh sách lịch tập

  // Thêm sự kiện lọc lịch tập theo tên khách hàng
  const memberSearchInput = document.getElementById("memberSearchInput");
  memberSearchInput.addEventListener("input", (event) => {
    currentFilterQuery = event.target.value.trim().toLowerCase(); // Lưu trạng thái bộ lọc
    filterSchedulesByMember(currentFilterQuery);
  });

  loadTrainerFilter();
  loadMemberFilter();
});

document.getElementById("memberSearchInput").addEventListener("input", (event) => {
  currentMemberFilter = event.target.value.trim().toLowerCase(); // Lưu trạng thái bộ lọc khách hàng
  filterSchedulesByMember(currentMemberFilter);
});

// Hàm hiển thị lịch tập trong bảng
function renderSchedules(schedules) {
  // Xóa nội dung cũ trong bảng
  const rows = document.querySelectorAll(".schedule-table tbody tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      if (index > 0) {
        cell.innerHTML = "";
        cell.rowSpan = 1;
        cell.style.display = ""; // Reset hiển thị
      }
    });
  });

  // Tạo ma trận để kiểm soát cell đã render
  const cellRendered = Array.from({ length: rows.length }, () => Array(7).fill(false));

  schedules.forEach((schedule) => {
    const startHour = schedule.startHour || schedule.StartHour;
    const endHour = schedule.endHour || schedule.EndHour;
    const duration = endHour - startHour;
    const day = new Date(schedule.scheduleDate || schedule.ScheduleDate).getDay();
    const dayIndex = day === 0 ? 6 : day - 1;
    const startRowIndex = startHour - 5;

    if (startRowIndex >= 0 && startRowIndex < rows.length && dayIndex >= 0 && dayIndex < 7) {
      // Nếu cell này đã được render bởi một lịch khác (do rowSpan), bỏ qua
      if (cellRendered[startRowIndex][dayIndex]) return;

      const row = rows[startRowIndex];
      const cells = row.querySelectorAll("td");
      const targetCell = cells[dayIndex + 1];

      if (targetCell) {
        targetCell.innerHTML = `
          <div data-trainer-name="${(schedule.TrainerName || schedule.trainerName || "").toLowerCase()}" 
               data-member-name="${(schedule.MemberName || schedule.memberName || "").toLowerCase()}" 
               data-status="${schedule.status || schedule.Status}">
            <strong>${schedule.MemberName || schedule.memberName}</strong><br>
            PT: ${schedule.TrainerName || schedule.trainerName}<br>
            Trạng thái: ${schedule.status || schedule.Status}<br>
          </div>
        `;
        targetCell.rowSpan = duration;

        // Đánh dấu các cell bị gộp (rowSpan) là đã render
        for (let i = 0; i < duration; i++) {
          if (startRowIndex + i < rows.length) {
            cellRendered[startRowIndex + i][dayIndex] = true;
            if (i > 0) {
              // Xóa cell thừa
              const nextRow = rows[startRowIndex + i];
              const nextCells = nextRow.querySelectorAll("td");
              if (nextCells[dayIndex + 1]) {
                nextCells[dayIndex + 1].remove();
              }
            }
          }
        }
      }
    }
  });
}

// Hàm lọc lịch tập theo tên khách hàng
function filterSchedulesByMember(query) {
  const rows = document.querySelectorAll(".schedule-table tbody tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      if (index > 0) {
        const memberDiv = cell.querySelector("div[data-member-name]");
        if (memberDiv) {
          const memberName = memberDiv.getAttribute("data-member-name");
          if (memberName.includes(query)) {
            cell.style.display = ""; // Hiển thị ô nếu khớp
          } else {
            cell.style.display = "none"; // Ẩn ô nếu không khớp
          }
        }
      }
    });
  });
}

// Hàm lọc lịch tập theo HLV
function filterSchedulesByTrainer(trainerName) {
  const rows = document.querySelectorAll(".schedule-table tbody tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      if (index > 0) {
        const trainerDiv = cell.querySelector("div[data-trainer-name]");
        if (trainerDiv) {
          const cellTrainerName = trainerDiv.getAttribute("data-trainer-name");
          if (trainerName === "" || cellTrainerName === trainerName) {
            cell.style.display = ""; // Hiển thị ô nếu khớp hoặc không có bộ lọc
          } else {
            cell.style.display = "none"; // Ẩn ô nếu không khớp
          }
        } else if (trainerName === "") {
          cell.style.display = ""; // Hiển thị tất cả nếu không chọn HLV
        }
      }
    });
  });
}

// Hàm lọc lịch tập theo trạng thái
function filterSchedulesByStatus(status) {
  const rows = document.querySelectorAll(".schedule-table tbody tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      if (index > 0) { // Bỏ qua cột đầu tiên (khung giờ)
        const statusDiv = cell.querySelector("div[data-status]");
        if (statusDiv) {
          const cellStatus = statusDiv.getAttribute("data-status").trim();
          if (status === "" || cellStatus === status) {
            cell.style.display = ""; // Hiển thị ô nếu khớp hoặc không có bộ lọc
          } else {
            cell.style.display = "none"; // Ẩn ô nếu không khớp
          }
        } else {
          console.warn("Không tìm thấy div[data-status] trong ô:", cell);
        }
      }
    });
  });
}

// Thêm sự kiện cho dropdown HLV
document.getElementById("trainerFilter").addEventListener("change", (event) => {
  currentTrainerFilter = event.target.value.toLowerCase(); // Lưu trạng thái bộ lọc
  filterSchedulesByTrainer(currentTrainerFilter); // Áp dụng bộ lọc
});

// Thêm sự kiện cho dropdown trạng thái
document.getElementById("statusFilter").addEventListener("change", (event) => {
  currentStatusFilter = event.target.value.trim(); // Lưu trạng thái bộ lọc
  console.log("Trạng thái được chọn từ dropdown:", currentStatusFilter); // Kiểm tra giá trị được chọn
  filterSchedulesByStatus(currentStatusFilter); // Áp dụng bộ lọc
});

document.getElementById("statusFilter").value = currentStatusFilter;

// Tải danh sách HLV (chỉ lấy PT còn làm)
async function loadTrainers() {
  const response = await fetch("http://localhost:5000/api/employees");
  const trainers = await response.json();
  const trainerSelect = document.getElementById("trainer");
  trainerSelect.innerHTML = '<option value="">--- Chọn HLV ---</option>';
  trainers.forEach((trainer) => {
    const option = document.createElement("option");
    option.value = trainer.code;
    option.textContent = trainer.name;
    trainerSelect.appendChild(option);
  });
}

// Tải danh sách khách hàng
async function loadMembers() {
  const response = await fetch("http://localhost:5000/api/customers");
  const members = await response.json();
  const memberSelect = document.getElementById("customer-name");
  memberSelect.innerHTML = '<option value="">--- Chọn thành viên ---</option>';
  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.code;
    option.textContent = member.name;
    memberSelect.appendChild(option);
  });
}

// Đóng modal khi nhấn ra ngoài
window.addEventListener("click", (event) => {
  if (event.target === scheduleModal) {
    scheduleModal.style.display = "none";
  }
});

document.getElementById("prev-week").addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 7); // Lùi 7 ngày
  updateWeekHeader();
  fetchSchedules(); // Tải lại lịch tập
});

document.getElementById("next-week").addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 7); // Tiến 7 ngày
  updateWeekHeader();
  fetchSchedules(); // Tải lại lịch tập
});

function loadSchedules() {
  const currentDate = new Date(); // Ngày hiện tại
  const startOfWeek = new Date(currentDate);
  const dayOfWeek = startOfWeek.getDay(); // Lấy thứ trong tuần (0: Chủ nhật, 1: Thứ 2, ...)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là Chủ nhật, lùi về Thứ 2 tuần trước
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday); // Lùi về Thứ 2

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Chủ nhật

  console.log("startOfWeek:", startOfWeek.toISOString(), "endOfWeek:", endOfWeek.toISOString());

  fetch(`http://localhost:5000/api/schedules?startDate=${startOfWeek.toISOString()}&endDate=${endOfWeek.toISOString()}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const tableBody = document.getElementById('schedule-table-body');
      tableBody.innerHTML = ''; // Xóa các hàng cũ

      data.forEach((schedule) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${schedule.ScheduleID}</td>
          <td>${schedule.MemberName}</td>
          <td>${schedule.TrainerName}</td>
          <td>${schedule.ScheduleDate.split('T')[0]}</td>
          <td>${schedule.StartHour}</td>
          <td>${schedule.EndHour}</td>
          <td>${schedule.Status}</td>
          <td>
            <button class="btn btn-danger" onclick="deleteSchedule('${schedule.ScheduleID}')">Xóa</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error('Lỗi khi tải danh sách ca tập:', error);
      alert('Không thể tải danh sách lịch tập. Vui lòng thử lại sau!');
    });
}

app.get("/api/schedules", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await pool.request()
      .input("startDate", sql.Date, startDate)
      .input("endDate", sql.Date, endDate)
      .query(`
        SELECT 
          Schedules.ScheduleID, 
          Members.Name AS MemberName, 
          Trainers.Name AS TrainerName, 
          Schedules.ScheduleDate, 
          Schedules.StartHour, 
          Schedules.EndHour,
          Schedules.Status
        FROM Schedules
        JOIN Members ON Schedules.MemberID = Members.MemberID
        JOIN Trainers ON Schedules.TrainerID = Trainers.TrainerID
        WHERE Schedules.ScheduleDate >= @startDate AND Schedules.ScheduleDate <= @endDate
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Lấy danh sách khách hàng
function fetchMembers() {
  fetch('/api/customers')
    .then((response) => response.json())
    .then((data) => {
      const memberSelect = document.getElementById('member-select');
      memberSelect.innerHTML = '';
      data.forEach((member) => {
        const option = document.createElement('option');
        option.value = member.code;
        option.textContent = member.name;
        memberSelect.appendChild(option);
      });
    })
    .catch((error) => console.error('Lỗi khi tải danh sách khách hàng:', error));
}

// Tìm kiếm khách hàng
function searchCustomers() {
  const searchInput = document.getElementById('customer-search');
  const searchTerm = searchInput.value.trim();

  if (searchTerm.length === 0) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  fetch(`/api/customers/search?name=${encodeURIComponent(searchTerm)}`)
    .then((response) => response.json())
    .then((data) => {
      const resultsDiv = document.getElementById('search-results');
      resultsDiv.innerHTML = '';

      if (data.length === 0) {
        resultsDiv.innerHTML = '<p>Không tìm thấy khách hàng nào</p>';
        return;
      }

      const ul = document.createElement('ul');
      data.forEach((customer) => {
        const li = document.createElement('li');
        li.textContent = `${customer.name} - ${customer.phone}`;
        li.onclick = () => {
          document.getElementById('customer-name').value = customer.name;
          document.getElementById('customer-phone').value = customer.phone;
          resultsDiv.innerHTML = '';
        };
        ul.appendChild(li);
      });
      resultsDiv.appendChild(ul);
    })
    .catch((error) => console.error('Lỗi khi tìm kiếm khách hàng:', error));
}

// Hàm lấy lịch tập theo tuần hiện tại
function fetchSchedules() {
  // Tính toán ngày đầu tuần và cuối tuần dựa trên currentDate
  const weekDates = getWeekDates(currentDate);
  const startOfWeek = weekDates[0];
  const endOfWeek = weekDates[6];

  fetch(`http://localhost:5000/api/schedules?startDate=${startOfWeek.toISOString()}&endDate=${endOfWeek.toISOString()}`)
    .then((response) => response.json())
    .then((schedules) => {
      allSchedules = schedules;
      applyAllFilters();
    })
    .catch((error) => {
      console.error("Lỗi khi tải lịch tập:", error);
    });
}

function applyAllFilters() {
  let filtered = allSchedules;

  // Lọc theo khách hàng (input)
  const memberQuery = document.getElementById("memberSearchInput").value.trim().toLowerCase();
  if (memberQuery) {
    filtered = filtered.filter(sch => (sch.MemberName || sch.memberName || "").toLowerCase().includes(memberQuery));
  }

  // Lọc theo HLV (dropdown)
  const trainerValue = document.getElementById("trainerFilter").value.trim().toLowerCase();
  if (trainerValue) {
    filtered = filtered.filter(sch => (sch.TrainerName || sch.trainerName || "").toLowerCase() === trainerValue);
  }

  // Lọc theo trạng thái (dropdown)
  const statusValue = document.getElementById("statusFilter").value.trim();
  if (statusValue) {
    filtered = filtered.filter(sch => (sch.status || sch.Status) === statusValue);
  }

  renderSchedules(filtered);
}

// Gắn sự kiện cho các bộ lọc
const memberSearchInput = document.getElementById("memberSearchInput");
if (memberSearchInput) {
  memberSearchInput.addEventListener("input", applyAllFilters);
}
let trainerFilterSelect = document.getElementById("trainerFilter");
if (trainerFilterSelect) {
  trainerFilterSelect.addEventListener("change", applyAllFilters);
}
const statusFilterSelect = document.getElementById("statusFilter");
if (statusFilterSelect) {
  statusFilterSelect.addEventListener("change", applyAllFilters);
}

// Khi chuyển tuần, gọi lại fetchSchedules
const prevWeekBtn = document.getElementById("prev-week");
if (prevWeekBtn) {
  prevWeekBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 7);
    updateWeekHeader();
    fetchSchedules();
  });
}
const nextWeekBtn = document.getElementById("next-week");
if (nextWeekBtn) {
  nextWeekBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 7);
    updateWeekHeader();
    fetchSchedules();
  });
}

// Tải danh sách HLV cho dropdown lọc
async function loadTrainerFilter() {
  const response = await fetch("http://localhost:5000/api/employees");
  const trainers = await response.json();
  const trainerFilter = document.getElementById("trainerFilter");
  if (!trainerFilter) return;
  trainerFilter.innerHTML = '<option value="">--- Tìm theo HLV ---</option>';
  trainers.forEach((trainer) => {
    const option = document.createElement("option");
    option.value = trainer.name.toLowerCase();
    option.textContent = trainer.name;
    trainerFilter.appendChild(option);
  });
}

// Tải danh sách khách hàng cho dropdown lọc
async function loadMemberFilter() {
  const response = await fetch("http://localhost:5000/api/customers");
  const members = await response.json();
  const memberFilter = document.getElementById("memberFilter");
  if (!memberFilter) return;
  memberFilter.innerHTML = '<option value="">--- Tìm theo khách hàng ---</option>';
  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.name.toLowerCase();
    option.textContent = member.name;
    memberFilter.appendChild(option);
  });
}

// Gọi khi trang load
window.addEventListener("DOMContentLoaded", () => {
  loadTrainerFilter();
  loadMemberFilter();
});

document.getElementById("memberSearchInput").addEventListener("input", applyAllFilters);
document.getElementById("trainerFilter").addEventListener("change", applyAllFilters);
document.getElementById("statusFilter").addEventListener("change", applyAllFilters);







