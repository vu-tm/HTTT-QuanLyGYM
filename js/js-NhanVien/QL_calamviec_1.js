// THÊM CÁC NHÂN VIÊN CÓ CA LÀM VÀO BẢNG
let allShifts = [];
let employees = [];

// Hàm fetch danh sách ca làm và nhân viên từ API
async function fetchShiftsAndEmployees() {
    // Lấy danh sách ca làm
    const shiftRes = await fetch('http://localhost:5000/api/shifts');
    allShifts = await shiftRes.json();
    // Lấy danh sách nhân viên
    const empRes = await fetch('http://localhost:5000/api/employees');
    employees = await empRes.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    const shiftTableBody = document.getElementById('shiftTableBody');
    const searchNameInput = document.getElementById('searchName');
    const searchScheduleInput = document.getElementById('searchSchedule');
    const searchDateInput = document.getElementById('dateRange');

    // Hàm tải và hiển thị dữ liệu
    async function loadAndRenderShifts() {
        await fetchShiftsAndEmployees();
        renderShiftTable(allShifts);
    }

    // Hàm hiển thị bảng
    function renderShiftTable(shifts) {
        shiftTableBody.innerHTML = '';

        if (shifts.length === 0) {
            shiftTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888">Không có ca làm việc nào</td></tr>`;
            return;
        }

        shifts.forEach((shift, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <i class="fas fa-trash delete-shift-icon" data-code="${shift.code}" style="color:red; cursor:pointer;" title="Xoá lịch làm"></i>
                </td>
                <td>${shift.code || shift.employeeCode}</td>
                <td>${shift.name || shift.employeeName}</td>
                <td>${shift.scheduleName}</td>
                <td>${shift.startDate}</td>
                <td>${shift.endDate}</td>
                <td>${shift.cycle}</td>
            `;
            shiftTableBody.appendChild(row);
        });

        // Gắn sự kiện xoá
        document.querySelectorAll('.delete-shift-icon').forEach(icon => {
            icon.addEventListener('click', async function() {
                const code = this.dataset.code;
                if (code && confirm('Bạn có chắc chắn muốn xoá ca làm này?')) {
                    const res = await fetch(`http://localhost:5000/api/shifts/${code}`, { method: 'DELETE' });
                    if (res.ok) {
                        await loadAndRenderShifts();
                    } else {
                        const errText = await res.text();
                        alert('Lỗi khi xóa ca làm: ' + errText);
                    }
                }
            });
        });
    }

    // Hàm lọc theo tên, lịch, ngày
    function filterShifts() {
        const nameKeyword = searchNameInput.value.trim().toLowerCase();
        const scheduleKeyword = searchScheduleInput.value.trim().toLowerCase();
        const dateRange = searchDateInput.value.trim();

        let fromDate = null, toDate = null;
        if (dateRange.includes('đến')) {
            const [fromStr, toStr] = dateRange.split('đến').map(s => s.trim());
            fromDate = moment(fromStr, 'DD/MM/YYYY');
            toDate = moment(toStr, 'DD/MM/YYYY');
        }

        const filtered = allShifts.filter(shift => {
            const matchName = (shift.name || shift.employeeName || '').toLowerCase().includes(nameKeyword);
            const matchSchedule = (shift.scheduleName || '').toLowerCase().includes(scheduleKeyword);

            let matchDate = true;
            if (fromDate && toDate) {
                const shiftStart = moment(shift.startDate, 'DD/MM/YYYY');
                const shiftEnd = shift.endDate ? moment(shift.endDate, 'DD/MM/YYYY') : null;
                matchDate = shiftStart.isSameOrBefore(toDate) && (shiftEnd ? shiftEnd.isSameOrAfter(fromDate) : true);
            }
            return matchName && matchSchedule && matchDate;
        });

        renderShiftTable(filtered);
    }

    // Gắn sự kiện tìm kiếm
    searchNameInput.addEventListener('input', filterShifts);
    searchScheduleInput.addEventListener('input', filterShifts);

    // Khởi tạo lịch bằng daterangepicker
    $(function() {
        $('#dateRange').daterangepicker({
            autoUpdateInput: false,
            locale: {
                format: 'DD/MM/YYYY',
                cancelLabel: 'Xoá',
                applyLabel: 'Lọc'
            }
        });

        $('#dateRange').on('apply.daterangepicker', function(ev, picker) {
            const start = picker.startDate.format('DD/MM/YYYY');
            const end = picker.endDate.format('DD/MM/YYYY');
            $(this).val(`${start} đến ${end}`);
            filterShifts();
        });

        $('#dateRange').on('cancel.daterangepicker', function() {
            $(this).val('');
            filterShifts();
        });
    });

    // Tải dữ liệu ban đầu
    await loadAndRenderShifts();
});

// MODAL THÊM CA LÀM VIỆC CỦA NHÂN VIÊN
// hiển thị modal
document.getElementById('createShiftBtn').addEventListener('click', () => {
    const modal = document.getElementById('shiftCreationModal');
    modal.style.display = 'flex';
    modal.classList.add('modal-open');
    populateEmployeeSelect();

    // Khởi tạo lại datepicker cho input ngày
    $('#startDateInput').daterangepicker({
        singleDatePicker: true,
        autoUpdateInput: true,
        locale: { format: 'DD/MM/YYYY' }
    });
    $('#endDateInput').daterangepicker({
        singleDatePicker: true,
        autoUpdateInput: true,
        locale: { format: 'DD/MM/YYYY' }
    });
});

// đóng modal
function closeShiftModal() {
    const modal = document.getElementById('shiftCreationModal');
    modal.style.display = 'none';
    modal.classList.remove('modal-open');
}

document.getElementById('closeShiftModal').addEventListener('click', closeShiftModal);
document.getElementById('cancelShiftModal').addEventListener('click', closeShiftModal);

// modal 
function populateEmployeeSelect() {
    const select = document.getElementById('selectEmployee');
    select.innerHTML = '';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.code;
        option.textContent = `${emp.code} - ${emp.name}`;
        select.appendChild(option);
    });
}

// lưu thông tin ca làm vừa thêm
document.getElementById('saveShiftDataBtn').addEventListener('click', async function () {
    const employeeCode = document.getElementById('selectEmployee').value;
    const scheduleName = document.getElementById('scheduleNameInput').value.trim();
    const startDate = document.getElementById('startDateInput').value.trim();
    const endDate = document.getElementById('endDateInput').value.trim();
    const cycle = document.getElementById('cycleInput').value;

    if (!employeeCode || !scheduleName || !startDate || !cycle) {
        alert('Vui lòng nhập đầy đủ các trường bắt buộc!');
        return;
    }

    const newShift = {
        employeeCode,
        scheduleName,
        startDate: convertToSQLDate(startDate),
        endDate: endDate ? convertToSQLDate(endDate) : null,
        cycle
    };

    const res = await fetch('http://localhost:5000/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift)
    });

    if (res.ok) {
        closeShiftModal();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    } else {
        const errText = await res.text();
        alert('Lỗi khi thêm ca làm: ' + errText);
    }
});

// XÓA CA LÀM QUA API
async function deleteShiftById(shiftId) {
    await fetch(`http://localhost:5000/api/shifts/${shiftId}`, {
        method: 'DELETE'
    });
}

function convertToSQLDate(dateStr) {
    // dateStr: dd/MM/yyyy
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
