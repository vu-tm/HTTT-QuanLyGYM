// Lấy danh sách HLV từ API, có thể truyền tên để tìm kiếm
async function fetchTrainers(searchName = "") {
  try {
    let url = "http://localhost:5000/api/employees";
    if (searchName) {
      url = `http://localhost:5000/api/employees/search?name=${encodeURIComponent(searchName)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Không thể tải danh sách HLV");
    const trainers = await response.json();

    const tableBody = document.querySelector("#trainer-table tbody");
    tableBody.innerHTML = ""; // Xóa dữ liệu cũ

    trainers.forEach((trainer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${trainer.code}</td>
        <td>${trainer.name}</td>
        <td>${trainer.phone || "Chưa cập nhật"}</td>
        <td>${trainer.status || "Chưa cập nhật"}</td>
        <td>
          <button class="delete-btn" data-id="${trainer.code}">Xóa</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Gắn sự kiện xóa
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const trainerID = event.target.dataset.id;
        await deleteTrainer(trainerID);
        fetchTrainers(); // Tải lại danh sách
      });
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách HLV:", error);
  }
}

// Thêm HLV
async function addTrainer(event) {
  event.preventDefault();
  // Lấy giá trị các trường
  const code = document.getElementById("trainer-code").value.trim();
  const name = document.getElementById("trainer-name").value.trim();
  const dob = document.getElementById("trainer-dob").value;
  const sex = document.getElementById("trainer-sex").value;
  const phone = document.getElementById("trainer-phone").value.trim();
  const address = document.getElementById("trainer-address").value.trim();
  const email = document.getElementById("trainer-email").value.trim();
  let status = document.getElementById("trainer-status").value;
  if (status === "Đang làm việc") status = "Đang làm";
  if (status === "Đã nghỉ việc") status = "Nghỉ việc";
  const contractType = document.getElementById("trainer-contract").value.trim();
  const salary = parseInt(document.getElementById("trainer-salary").value, 10);

  // Gửi lên API
  const response = await fetch("http://localhost:5000/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code, name, dob, sex, phone, address, email, status,
      contractType, salary,
      position: "Huấn luyện viên"
    }),
  });

  if (!response.ok) {
    alert("Không thể thêm HLV");
    return;
  }
  alert("Thêm HLV thành công!");
  document.getElementById("add-trainer-modal").style.display = "none";
  fetchTrainers();
}

// Xóa HLV
async function deleteTrainer(trainerID) {
  try {
    const response = await fetch(`http://localhost:5000/api/employees/${trainerID}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Không thể xóa HLV");
    alert("Xóa HLV thành công!");
  } catch (error) {
    console.error("Lỗi khi xóa HLV:", error);
  }
}

// Hiển thị modal thêm HLV
document.getElementById("add-trainer-btn").addEventListener("click", () => {
  document.getElementById("add-trainer-modal").style.display = "flex";
});

// Đóng modal
document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("add-trainer-modal").style.display = "none";
});

// Tải danh sách HLV khi trang được tải
document.addEventListener("DOMContentLoaded", fetchTrainers);

// Sự kiện tìm kiếm theo tên
document.getElementById("search-trainer").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  fetchTrainers(query);
});

document.getElementById("add-trainer-form").addEventListener("submit", addTrainer);