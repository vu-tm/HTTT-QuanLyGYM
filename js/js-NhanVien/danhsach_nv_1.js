document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.section-body input[type="text"]');
    const statusRadios = document.querySelectorAll('input[name="status"]');
    const positionCheckboxes = document.querySelectorAll('.section-body input[type="checkbox"]');
    let currentPage = 1;
    let recordsPerPage = 10;
    let employees = [];

    // Hàm format tiền tệ
    function formatCurrency(amount) {
        return parseInt(amount).toLocaleString('vi-VN') + ' VNĐ';
    }

    // Hàm tạo các icon hành động
    function createActionIcons(employeeCode) {
        return `
            <div class="action-icons">
                <i class="fa fa-eye" onclick="viewEmployee('${employeeCode}')"></i>
                <i class="fa fa-cog" onclick="editEmployee('${employeeCode}')"></i>
                <i class="fa fa-trash" onclick="deleteEmployee('${employeeCode}')"></i>
            </div>
        `;
    }

    // Hàm group dữ liệu nhân viên và ca làm
    function groupEmployeesWithShifts(data) {
        const map = {};
        data.forEach(row => {
            if (!map[row.code]) {
                map[row.code] = {
                    code: row.code,
                    name: row.name,
                    phone: row.phone,
                    email: row.email,
                    address: row.address,
                    dob: row.dob,
                    sex: row.sex,
                    status: row.status,
                    contractType: row.contractType,
                    salary: row.salary,
                    position: row.position,
                    photo: row.photo,
                    shifts: []
                };
            }
            if (row.scheduleName) {
                map[row.code].shifts.push({
                    scheduleName: row.scheduleName,
                    startDate: row.startDate,
                    endDate: row.endDate,
                    cycle: row.cycle,
                    status: row.status
                });
            }
        });
        return Object.values(map);
    }

    // Hàm lấy dữ liệu từ SQL Server
    async function fetchEmployees(resetPage = false) {
        try {
            const response = await fetch('http://localhost:5000/api/employees/all');
            const rawData = await response.json();
            employees = groupEmployeesWithShifts(rawData);
            if (resetPage) currentPage = 1;
            renderEmployeeTable();
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    }

    // Hàm hiển thị danh sách nhân viên
    function renderEmployeeTable() {
        const tbody = document.getElementById('roleList');
        const filteredEmployees = applyFilters(employees);

        const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);
        console.log('Trước khi điều chỉnh - currentPage:', currentPage, 'totalPages:', totalPages);
        
        // Kiểm tra và điều chỉnh trang hiện tại nếu cần
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        console.log('Sau khi điều chỉnh - currentPage:', currentPage, 'totalPages:', totalPages);
        
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (paginatedEmployees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="no-data">Không tìm thấy bản ghi nào</td></tr>`;
        } else {
            paginatedEmployees.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${createActionIcons(employee.code)}</td>
                    <td>${employee.code}</td>
                    <td>${employee.name}</td>
                    <td>${employee.phone}</td>
                    <td>${employee.email || 'N/A'}</td>
                    <td>${employee.address}</td>
                    <td>${employee.sex}</td>
                    <td>
                        <span class="status-${employee.status === 'Đang làm' ? 'working' : 'resigned'}">
                            ${employee.status}
                        </span>
                    </td>
                    <td>${employee.contractType}</td>
                    <td>${formatCurrency(employee.salary)}</td>
                    <td>${employee.position}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // Cập nhật phân trang
        updatePagination(totalPages);

        // Cập nhật tổng số nhân viên
        document.querySelector('.footer-note').textContent = `Tổng số nhân viên: ${filteredEmployees.length}`;
    }

    // Hàm cập nhật phân trang
    function updatePagination(totalPages) {
        const pageInfo = document.getElementById('pageInfo');
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        console.log('updatePagination - Trước khi điều chỉnh - currentPage:', currentPage, 'totalPages:', totalPages);

        // Đảm bảo currentPage không vượt quá tổng số trang
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }

        console.log('updatePagination - Sau khi điều chỉnh - currentPage:', currentPage, 'totalPages:', totalPages);

        pageInfo.textContent = `Trang ${currentPage} / ${Math.max(1, totalPages)}`;
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages || totalPages === 0;
    }

    // Xử lý thay đổi số bản ghi hiển thị
    document.getElementById('records').addEventListener('change', function (e) {
        recordsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset về trang đầu khi thay đổi số bản ghi
        renderEmployeeTable();
    });

    // Thêm event listener mới
    document.getElementById('prevPage').addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderEmployeeTable();
        }
    });

    document.getElementById('nextPage').addEventListener('click', function () {
        const filteredEmployees = applyFilters(employees);
        const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderEmployeeTable();
        }
    });

    // Khởi tạo ban đầu
    document.querySelectorAll('.section-body input[type="checkbox"]').forEach(cb => cb.checked = true);
    fetchEmployees();

    // ================= MODAL THÊM NHÂN VIÊN MỚI VÀO BẢNG

    // Sự kiện mở modal thêm nhân viên
    document.getElementById('openAddEmployeeModal').addEventListener('click', function () {
        const modal = document.getElementById('addEmployeeModal');
        document.getElementById('empCode').value = '';
        // Reset trạng thái mặc định
        document.querySelector('[data-status="Đang làm"]').classList.add('active');
        document.querySelector('[data-status="Nghỉ việc"]').classList.remove('active');
        modal.classList.add('modal-open');
        modal.style.display = 'flex';
    });

    // Hàm đóng modal
    function closeModal() {
        const modal = document.getElementById('addEmployeeModal');
        modal.classList.remove('modal-open');
        modal.style.display = 'none';
        // Reset toàn bộ form
        document.querySelectorAll('#addEmployeeModal input').forEach(input => input.value = '');
    }

    // Sự kiện đóng modal
    document.getElementById('closeAddEmployeeModal').addEventListener('click', closeModal);
    document.getElementById('cancelAddEmployeeModal').addEventListener('click', closeModal);

    // Xử lý thêm nhân viên mới
    document.getElementById('saveEmployeeBtn').addEventListener('click', async function () {
        // Lấy giá trị từ form
        const empCode = document.getElementById('empCode').value.trim().toUpperCase();
        const empName = document.getElementById('empName').value.trim();
        const empDob = document.getElementById('empDob').value.trim();
        const empSex = document.getElementById('empSex').value;
        const empPhone = document.getElementById('empPhone').value.trim();
        const empAddress = document.getElementById('empAddress').value.trim();
        const empEmail = document.getElementById('empEmail').value.trim();
        const empStatus = document.querySelector('.status-btn.active')?.dataset.status || 'Đang làm';
        const empPosition = document.getElementById('empPosition').value;
        const empContractType = document.getElementById('empContractType').value;
        const empSalary = parseInt(document.getElementById('empSalary').value.replace(/\D/g, ''), 10);

        if (!empCode || !empName || !empDob || !empSex || !empPhone || !empAddress || !empStatus || !empContractType || !empSalary) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
            return;
        }

        const newEmployee = {
            code: empCode,
            name: empName,
            dob: empDob,
            sex: empSex,
            phone: empPhone,
            address: empAddress,
            email: empEmail || null,
            status: empStatus,
            position: empPosition,
            contractType: empContractType,
            salary: empSalary,
            photo: ''
        };

        try {
            const response = await fetch('http://localhost:5000/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEmployee)
            });

            if (response.ok) {
                await fetchEmployees(true); // reset về trang 1
                closeModal();
                alert('Thêm nhân viên thành công!');
            } else {
                const errorText = await response.text();
                alert(errorText);
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Có lỗi xảy ra khi thêm nhân viên!');
        }
    });

    // =============== XỬ LÝ CHỌN TRẠNG THÁI ===============
    document.querySelectorAll('.status-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // TÌM KIẾM - BỘ LỌC
    function applyFilters(data) {
        const searchValue = searchInput.value.trim().toLowerCase();

        let filtered = data.filter(emp => {
            const keyword = `${emp.name} ${emp.phone} ${emp.email || ''}`.toLowerCase();
            return keyword.includes(searchValue);
        });

        const selectedStatus = document.querySelector('input[name="status"]:checked').value;
        if (selectedStatus !== 'Tất cả') {
            let statusText = selectedStatus === 'Đang làm việc' ? 'Đang làm' : 'Nghỉ việc';
            filtered = filtered.filter(emp => emp.status === statusText);
        }

        const selectedPositions = Array.from(positionCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.nextSibling.textContent.trim());
        filtered = filtered.filter(emp => selectedPositions.includes(emp.position));

        return filtered;
    }

    // Xử lý xóa nhân viên
    window.deleteEmployee = async function(employeeCode) {
        if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/employees/${employeeCode}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await fetchEmployees();
                } else {
                    const errorText = await response.text();
                    alert(errorText || 'Không thể xóa nhân viên. Vui lòng thử lại sau!');
                }
            } catch (error) {
                console.error('Error deleting employee:', error);
                alert('Có lỗi xảy ra khi xóa nhân viên!');
            }
        }
    };

    // Xử lý xem chi tiết nhân viên
    window.viewEmployee = function(employeeCode) {
        const employee = employees.find(emp => emp.code === employeeCode);
        if (!employee) return;

        document.getElementById('infoEmpCode').textContent = employee.code;
        document.getElementById('infoEmpName').textContent = employee.name;
        document.getElementById('infoEmpDob').textContent = employee.dob;
        document.getElementById('infoEmpSex').textContent = employee.sex;
        document.getElementById('infoEmpPhone').textContent = employee.phone;
        document.getElementById('infoEmpAddress').textContent = employee.address;
        document.getElementById('infoEmpEmail').textContent = employee.email || '---';
        document.getElementById('infoEmpStatus').textContent = employee.status;
        document.getElementById('infoEmpContractType').textContent = employee.contractType;
        document.getElementById('infoEmpSalary').textContent = employee.salary;
        document.getElementById('infoEmpPosition').textContent = employee.position || '---';

        const photoElement = document.getElementById('employeePhoto');
        photoElement.innerHTML = '';

        if (employee.photoUrl) {
            const img = document.createElement('img');
            img.src = employee.photoUrl;
            img.alt = 'Ảnh nhân viên';
            img.classList.add('employee-avatar-img');
            photoElement.appendChild(img);
        } else {
            photoElement.innerHTML = '<i class="fa fa-user"></i>';
        }

        const modal = document.getElementById('employeeInfoModal');
        modal.style.display = 'flex';
        modal.classList.add('modal-open');
    };

    // Xử lý chỉnh sửa nhân viên
    window.editEmployee = function(employeeCode) {
        const shiftModal = document.getElementById('shiftModal');
        shiftModal.style.display = 'flex';
        shiftModal.classList.add('modal-open');
        sessionStorage.setItem('editingEmployeeCode', employeeCode);
        renderShiftsForEmployee(employeeCode);
    };

    // Các event listeners
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderEmployeeTable();
    });

    statusRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            currentPage = 1;
            renderEmployeeTable();
        });
    });

    positionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            currentPage = 1;
            renderEmployeeTable();
        });
    });

    document.getElementById('records').addEventListener('change', function (e) {
        recordsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderEmployeeTable();
    });

    // Khởi tạo ban đầu
    document.querySelectorAll('.section-body input[type="checkbox"]').forEach(cb => cb.checked = true);
    fetchEmployees();

    // ================= MODAL THÊM NHÂN VIÊN MỚI VÀO BẢNG

    // Sự kiện mở modal thêm nhân viên
    document.getElementById('openAddEmployeeModal').addEventListener('click', function () {
        const modal = document.getElementById('addEmployeeModal');
        document.getElementById('empCode').value = '';
        // Reset trạng thái mặc định
        document.querySelector('[data-status="Đang làm"]').classList.add('active');
        document.querySelector('[data-status="Nghỉ việc"]').classList.remove('active');
        modal.classList.add('modal-open');
        modal.style.display = 'flex';
    });

    // Hàm đóng modal
    function closeModal() {
        const modal = document.getElementById('addEmployeeModal');
        modal.classList.remove('modal-open');
        modal.style.display = 'none';
        // Reset toàn bộ form
        document.querySelectorAll('#addEmployeeModal input').forEach(input => input.value = '');
    }

    // Sự kiện đóng modal
    document.getElementById('closeAddEmployeeModal').addEventListener('click', closeModal);
    document.getElementById('cancelAddEmployeeModal').addEventListener('click', closeModal);


    // =============== XỬ LÝ CHỌN TRẠNG THÁI ===============
    document.querySelectorAll('.status-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ================ CÁC ICON TRONG CỘT HÀNH ĐỘNG
    // xem quản lý ca làm việc nhân viên (icon bánh răng)
    window.editEmployee = function(employeeCode) {
        const shiftModal = document.getElementById('shiftModal');
        shiftModal.style.display = 'flex';
        shiftModal.classList.add('modal-open');
        
        // Lưu mã nhân viên vào sessionStorage để sử dụng khi thêm ca làm
        sessionStorage.setItem('editingEmployeeCode', employeeCode);
        
        renderShiftsForEmployee(employeeCode);
    };
    
    // Đóng modal khi click nút đóng hoặc hủy
    document.getElementById('shiftModalClose').addEventListener('click', closeShiftModal);
    document.getElementById('shiftModalCancel').addEventListener('click', closeShiftModal);
    
    function closeShiftModal() {
        const shiftModal = document.getElementById('shiftModal');
        shiftModal.classList.remove('modal-open');
        shiftModal.style.display = 'none';
    }
    
    // Thay thế hàm renderShiftsForEmployee
    async function renderShiftsForEmployee(employeeCode) {
        const shiftBody = document.getElementById('shiftList');
        const shiftTotal = document.getElementById('shiftTotal');
        shiftBody.innerHTML = '';

        // Lấy ca làm từ API
        let shifts = [];
        try {
            const res = await fetch('http://localhost:5000/api/shifts');
            const allShifts = await res.json();
            shifts = allShifts.filter(shift => shift.employee_code === employeeCode);
        } catch (e) {
            shiftBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888">Không lấy được dữ liệu ca làm</td></tr>`;
            shiftTotal.textContent = '0';
            return;
        }

        if (shifts.length === 0) {
            shiftBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888">Không có ca làm việc nào</td></tr>`;
            shiftTotal.textContent = '0';
            return;
        }

        shifts.forEach((shift) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <i class="fa fa-trash shift-delete-icon" data-code="${shift.code}" style="cursor:pointer; color:red;" title="Xoá ca làm"></i>
                </td>
                <td>${shift.employeeName}</td>
                <td>${shift.scheduleName}</td>
                <td>${shift.startDate}</td>
                <td>${shift.endDate}</td>
                <td>${shift.cycle}</td>
            `;
            shiftBody.appendChild(row);
        });

        // Gắn sự kiện xoá
        shiftBody.querySelectorAll('.shift-delete-icon').forEach(icon => {
            icon.addEventListener('click', async function () {
                const code = this.dataset.code;
                if (confirm('Bạn có chắc chắn muốn xóa ca làm này?')) {
                    await fetch(`http://localhost:5000/api/shifts/${code}`, { method: 'DELETE' });
                    renderShiftsForEmployee(employeeCode);
                }
            });
        });

        shiftTotal.textContent = shifts.length;
    }

    // Sửa sự kiện Lưu ca làm mới
    document.getElementById('saveShiftBtn').addEventListener('click', async () => {
        const employeeCode = sessionStorage.getItem('editingEmployeeCode');
        const scheduleName = document.getElementById('shiftScheduleName').value.trim();
        const startDate = document.getElementById('shiftStartDate').value.trim();
        const endDate = document.getElementById('shiftEndDate').value.trim();
        const cycle = document.getElementById('shiftCycle').value;

        if (!scheduleName || !startDate || !endDate || !cycle) {
            alert('Vui lòng nhập đầy đủ thông tin ca làm!');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeCode, scheduleName, startDate, endDate, cycle })
            });
            if (res.ok) {
                renderShiftsForEmployee(employeeCode);
                closeAddShiftModal();
            } else {
                alert(await res.text());
            }
        } catch (e) {
            alert('Lỗi khi thêm ca làm!');
        }
    });

    // THÊM MỚI CA LÀM CỦA NHÂN VIÊN TRONG MODAL XEM LỊCH LÀM
    // Mở modal thêm ca làm khi bấm "Tạo mới"
    document.getElementById('addShiftBtn').addEventListener('click', () => {
        const modal = document.getElementById('addShiftModal');
        modal.style.display = 'flex';
        modal.classList.add('modal-open');
    });

    // Đóng modal
    document.getElementById('addShiftModalClose').addEventListener('click', closeAddShiftModal);
    document.getElementById('cancelAddShiftModal').addEventListener('click', closeAddShiftModal);

    function closeAddShiftModal() {
        const modal = document.getElementById('addShiftModal');
        modal.classList.remove('modal-open');
        modal.style.display = 'none';
        
        // Reset form
        document.getElementById('shiftScheduleName').value = '';
        document.getElementById('shiftStartDate').value = '';
        document.getElementById('shiftEndDate').value = '';
        document.getElementById('shiftCycle').value = 'Theo tuần';
    }

    // Đóng modal
    document.getElementById('employeeInfoModalClose').addEventListener('click', closeEmployeeInfoModal);
    document.getElementById('employeeInfoModalCancel').addEventListener('click', closeEmployeeInfoModal);
    
    function closeEmployeeInfoModal() {
        const modal = document.getElementById('employeeInfoModal');
        modal.style.display = 'none';
        modal.classList.remove('modal-open');
    }
});


