// Mở modal thêm lịch tập
const addScheduleBtn = document.getElementById('add-schedule-btn');
const addScheduleModal = document.getElementById('add-schedule-modal');
const closeBtn = document.querySelector('.close-btn');

addScheduleBtn.addEventListener('click', () => {
  addScheduleModal.style.display = 'block';
  loadMembersAndTrainers(); // Tải danh sách khách hàng và huấn luyện viên
});

closeBtn.addEventListener('click', () => {
  addScheduleModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === addScheduleModal) {
    addScheduleModal.style.display = 'none';
  }
});

// Tải danh sách khách hàng và huấn luyện viên
function loadMembersAndTrainers() {
  // Tải danh sách khách hàng
  fetch('http://localhost:5000/api/customers')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const memberSelect = document.getElementById('member-id');
      memberSelect.innerHTML = ''; // Xóa các tùy chọn cũ
      
      // Thêm option mặc định
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Chọn khách hàng';
      memberSelect.appendChild(defaultOption);
      
      data.forEach((member) => {
        const option = document.createElement('option');
        option.value = member.code;
        option.textContent = member.name;
        memberSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error('Lỗi khi tải danh sách khách hàng:', error);
      alert('Không thể tải danh sách khách hàng. Vui lòng thử lại sau!');
    });

  // Tải danh sách huấn luyện viên
  fetch('http://localhost:5000/api/employees')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const trainerSelect = document.getElementById('trainer-id');
      trainerSelect.innerHTML = ''; // Xóa các tùy chọn cũ
      
      // Thêm option mặc định
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Chọn huấn luyện viên';
      trainerSelect.appendChild(defaultOption);
      
      data.forEach((trainer) => {
        const option = document.createElement('option');
        option.value = trainer.code;
        option.textContent = trainer.name;
        trainerSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error('Lỗi khi tải danh sách huấn luyện viên:', error);
      alert('Không thể tải danh sách huấn luyện viên. Vui lòng thử lại sau!');
    });
}

// Xử lý form thêm lịch tập
document.getElementById("add-schedule-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const memberID = document.getElementById("member-id").value;
  const trainerID = document.getElementById("trainer-id").value;
  const scheduleDate = document.getElementById("schedule-date").value;
  const startHour = document.getElementById("start-hour").value;
  const duration = document.getElementById("duration").value;
  const status = document.getElementById("status").value;

  if (
    !memberID ||
    !trainerID ||
    !scheduleDate ||
    startHour === "" ||
    duration === "" ||
    isNaN(parseInt(startHour, 10)) ||
    isNaN(parseInt(duration, 10))
  ) {
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
        duration: parseInt(duration, 10),
        status,
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      alert(errorMessage);
      return;
    }

    alert("Lưu lịch tập thành công!");
    document.getElementById("add-schedule-modal").style.display = "none";
    event.target.reset();
    loadSchedules();
  } catch (error) {
    console.error("Lỗi khi lưu lịch tập:", error);
  }
});

// Hàm tải danh sách lịch tập
function loadSchedules() {
  fetch('http://localhost:5000/api/schedules/qlcatap')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const tableBody = document.getElementById('schedule-table-body');
      tableBody.innerHTML = ''; // Xóa các hàng cũ

      const today = new Date();
      data.forEach((schedule) => {
        // Kiểm tra nếu ngày tập đã qua và chưa hoàn thành thì cập nhật trạng thái
        const scheduleDate = new Date(schedule.scheduleDate);
        let status = schedule.status;
        if (scheduleDate < today && status !== 'Hoàn thành') {
          status = 'Hoàn thành';
          // Gọi API cập nhật trạng thái trên server (nếu muốn cập nhật luôn ở DB)
          fetch(`http://localhost:5000/api/schedules/${schedule.code}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Hoàn thành' })
          }).catch(() => {});
        }

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${schedule.code}</td>
          <td>${schedule.MemberName}</td>
          <td>${schedule.TrainerName}</td>
          <td>${schedule.scheduleDate.split('T')[0]}</td>
          <td>${schedule.startHour}</td>
          <td>${schedule.endHour}</td>
          <td>${status}</td>
          <td>
            <button class="btn btn-danger" onclick="deleteSchedule('${schedule.code}')">Xóa</button>
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

// Hàm xóa lịch tập
function deleteSchedule(code) {
  if (confirm('Bạn có chắc chắn muốn xóa ca tập này?')) {
    fetch(`http://localhost:5000/api/schedules/${code}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Xóa ca tập thành công!');
        loadSchedules();
      })
      .catch((error) => {
        console.error('Lỗi khi xóa ca tập:', error);
      });
  }
}

// Gọi hàm loadSchedules khi trang được tải
document.addEventListener('DOMContentLoaded', loadSchedules);

document.getElementById("search-input").addEventListener("input", function() {
  const query = this.value.trim().toLowerCase();
  filterSchedules(query);
});

function filterSchedules(query) {
  const rows = document.querySelectorAll("#schedule-table-body tr");
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? "" : "none";
  });
}

document.getElementById("view-options").addEventListener("change", function() {
  const limit = parseInt(this.value, 10);
  showLimitedRows(limit);
});

function showLimitedRows(limit) {
  const rows = document.querySelectorAll("#schedule-table-body tr");
  rows.forEach((row, idx) => {
    row.style.display = idx < limit ? "" : "none";
  });
}