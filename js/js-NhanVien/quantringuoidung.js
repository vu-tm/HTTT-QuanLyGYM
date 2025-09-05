document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra và khởi tạo dữ liệu nhân viên nếu cần
    function initEmployees() {
        let existingEmployees = JSON.parse(localStorage.getItem('employees')) || [];

        // Fix cấu trúc dữ liệu nếu cần
        if (existingEmployees.length === 1 && typeof existingEmployees[0] === 'object') {
            // Chuyển đổi object thành mảng
            const employeesArray = [];
            for (const key in existingEmployees[0]) {
                if (!['shifts', 'Shifts'].includes(key) && typeof existingEmployees[0][key] === 'object') {
                    employeesArray.push(existingEmployees[0][key]);
                }
            }
            existingEmployees = employeesArray;
            localStorage.setItem('employees', JSON.stringify(existingEmployees));
        }

        if (existingEmployees.length === 0) {
            localStorage.setItem('employees', JSON.stringify([]));
        }
        return existingEmployees;
    }
    // Gọi hàm khởi tạo khi trang load
    const employees = initEmployees();

    // Elements for adding a new user
    const addUserBtn = document.querySelector('.btn-add');
    const addUserModal = document.getElementById('addUserModal');
    const closeAddUserModal = document.getElementById('closeAddUserModal');
    const cancelAddUserModal = document.getElementById('cancelAddUserModal');
    const createUserBtn = document.getElementById('createUserBtn');
    const userTableBody = document.querySelector('.user-table-body');
    const selectEmployee = document.getElementById('selectEmployee');

    // Elements for view user modal
    const viewUserModal = document.getElementById('viewUserModal');
    const closeViewUserModal = document.getElementById('closeViewUserModal');
    const cancelViewUserModal = document.getElementById('cancelViewUserModal');

    // Elements for "Xem tất cả"
    const viewAllBtn = document.querySelector('.btn-all');

    // Alert elements
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');

    // Load users from localStorage
    let savedUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Initial display of all users
    displayUsers(savedUsers);

    // Lấy danh sách nhân viên từ API
    async function fetchEmployeesForDropdown() {
        const res = await fetch('http://localhost:5000/api/employees/all');
        const data = await res.json();
        // Group lại nếu cần (nếu API trả về lặp)
        const map = {};
        data.forEach(row => {
            if (!map[row.code]) {
                map[row.code] = {
                    code: row.code,
                    name: row.name,
                    email: row.email
                };
            }
        });
        return Object.values(map);
    }

    // Lấy danh sách tài khoản người dùng từ API
    async function fetchUsers() {
        const res = await fetch('http://localhost:5000/api/users');
        return await res.json();
    }

    // Thêm tài khoản người dùng qua API
    async function addUserAPI(user) {
        const res = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    }

    // Xóa tài khoản người dùng qua API
    async function deleteUserAPI(username) {
        const res = await fetch(`http://localhost:5000/api/users/${username}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    }

    // Function to populate employees in the "Chọn nhân viên" dropdown
    async function populateEmployees() {
        selectEmployee.innerHTML = '<option value="">Chọn nhân viên</option>';
        const employees = await fetchEmployeesForDropdown();
        const users = await fetchUsers();
        const employeeCodesWithAccount = users.map(u => u.employee);
        employees.forEach(employee => {
            if (employee && employee.code && !employeeCodesWithAccount.includes(employee.code)) {
                const option = document.createElement('option');
                option.value = employee.code;
                option.textContent = `${employee.name} (${employee.code})`;
                option.dataset.name = employee.name || '';
                option.dataset.email = employee.email || '';
                selectEmployee.appendChild(option);
            }
        });
    }

    // Function to display users in the table
    async function displayUsers() {
        const users = await fetchUsers();
        userTableBody.innerHTML = '';
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; font-style: italic">Không có dữ liệu</td></tr>';
        } else {
            users.forEach((user, index) => {
                addUserToTable(user, index + 1);
            });
        }
    }

    // Function to add user to table
    function addUserToTable(user, index) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="action-cell">
                <button class="action-btn view"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete"><i class="fas fa-trash-alt"></i></button>
            </td>
            <td>${index}</td>
            <td>${user.username}</td>
            <td>${user.role || ''}</td>
            <td><span class="badge-approved">${user.approvalStatus || 'Chưa xác định'}</span></td>
            <td>
                <div class="lock-status ${user.locked == 1 ? 'locked' : 'unlocked'}">
                    <i class="fas ${user.locked == 1 ? 'fa-lock' : 'fa-lock-open'} lock-toggle-icon" style="cursor:pointer"></i>
                    <span>${user.locked == 1 ? 'Khóa' : 'Mở'}</span>
                </div>
            </td>
            <td>${user.createdAt ? (new Date(user.createdAt).toLocaleDateString('vi-VN')) : ''}</td>
        `;
        userTableBody.appendChild(newRow);

        // Add event listener for view button
        newRow.querySelector('.view').addEventListener('click', () => {
            showUserDetails(user);
        });

        // Add event listener for delete button
        newRow.querySelector('.delete').addEventListener('click', () => {
            deleteUser(user.username);
        });

        // Thêm sự kiện khóa/mở tài khoản
        newRow.querySelector('.lock-toggle-icon').addEventListener('click', async () => {
            const newLocked = user.locked == 1 ? 0 : 1;
            await fetch(`http://localhost:5000/api/users/${user.username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locked: newLocked })
            });
            await displayUsers();
        });
    }

    // Function to show user details in modal
    async function showUserDetails(user) {
        // Lấy tên nhân viên từ API hoặc cache
        const employees = await fetchEmployeesForDropdown();
        const emp = employees.find(e => e.code === user.employee_code || e.code === user.employee);
        document.getElementById('viewEmployeeName').value = emp ? emp.name : user.employee_code || user.employee || '';
        document.getElementById('viewUsername').value = user.username || '';
        document.getElementById('viewRole').value = user.role || '';
        document.getElementById('viewApprovalStatus').value = user.approvalStatus || '';
        document.getElementById('viewLockStatus').value = user.locked == 1 ? 'Khóa' : 'Mở';
        document.getElementById('viewCreatedAt').value = user.createdAt || '';
        viewUserModal.style.display = 'flex';
    }

    // Function to delete user
    async function deleteUser(username) {
        if (confirm(`Bạn có chắc muốn xóa tài khoản ${username}?`)) {
            try {
                await deleteUserAPI(username);
                await displayUsers();
                successAlert.textContent = 'Xóa tài khoản thành công!';
                successAlert.style.display = 'block';
                setTimeout(() => {
                    successAlert.style.display = 'none';
                    successAlert.textContent = 'Thêm thành công!';
                }, 1200);
            } catch (err) {
                errorAlert.textContent = err.message || 'Lỗi khi xóa tài khoản!';
                errorAlert.style.display = 'block';
                setTimeout(() => { errorAlert.style.display = 'none'; }, 1200);
            }
        }
    }

    // Event listeners for role filtering
    document.querySelectorAll('.role-item').forEach(item => {
        item.addEventListener('click', async () => {
            const roleName = item.querySelector('.role-name').textContent;
            // Highlight selected role
            document.querySelectorAll('.role-item').forEach(r => r.classList.remove('active'));
            item.classList.add('active');
            const users = await fetchUsers();
            if (roleName === 'Xem tất cả') {
                displayUsers(); // Hiển thị tất cả
            } else {
                const filteredUsers = users.filter(user => user.role === roleName);
                userTableBody.innerHTML = '';
                if (filteredUsers.length === 0) {
                    userTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; font-style: italic">Không có dữ liệu</td></tr>';
                } else {
                    filteredUsers.forEach((user, index) => {
                        addUserToTable(user, index + 1);
                    });
                }
            }
        });
    });

    // Event listeners for adding a new user
    addUserBtn.addEventListener('click', () => {
        populateEmployees();
        addUserModal.style.display = 'flex';

        // Debug: Kiểm tra giá trị trong dropdown
        setTimeout(() => {
            console.log('Giá trị dropdown sau khi mở modal:',
                Array.from(selectEmployee.options).map(opt => opt.value));
        }, 100);
    });

    closeAddUserModal.addEventListener('click', () => {
        addUserModal.style.display = 'none';
    });

    cancelAddUserModal.addEventListener('click', () => {
        addUserModal.style.display = 'none';
    });

    addUserModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            addUserModal.style.display = 'none';
        }
    });

    // Trong phần tạo user mới (thay thế phần hiện tại)
    createUserBtn.addEventListener('click', async () => {
        const employee = document.getElementById('selectEmployee').value;
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('selectRole').value;

        if (!employee || !username || !password || !confirmPassword || !role) {
            errorAlert.textContent = 'Vui lòng điền đầy đủ các trường bắt buộc!';
            errorAlert.style.display = 'block';
            setTimeout(() => { errorAlert.style.display = 'none'; }, 1200);
            return;
        }
        if (password !== confirmPassword) {
            errorAlert.textContent = 'Mật khẩu và nhập lại mật khẩu không khớp!';
            errorAlert.style.display = 'block';
            setTimeout(() => { errorAlert.style.display = 'none'; }, 1200);
            return;
        }
        // Kiểm tra username đã tồn tại chưa
        const users = await fetchUsers();
        const userExists = users.some(user => user.username === username);
        if (userExists) {
            errorAlert.textContent = 'Tên đăng nhập đã tồn tại!';
            errorAlert.style.display = 'block';
            setTimeout(() => { errorAlert.style.display = 'none'; }, 1200);
            return;
        }
        // Định dạng ngày giờ cho SQL
        function getSQLDateTimeString(date) {
            const pad = n => n < 10 ? '0' + n : n;
            return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
        }
        const newUser = {
            employee: employee,
            username: username,
            password: password,
            role: role,
            approvalStatus: 'Đã phê duyệt',
            locked: 0, // LUÔN gửi số 0 (mở), 1 (khóa)
            createdAt: getSQLDateTimeString(new Date())
        };
        try {
            await addUserAPI(newUser);
            await displayUsers();
            successAlert.style.display = 'block';
            setTimeout(() => { successAlert.style.display = 'none'; }, 1200);
            // Reset form
            document.getElementById('selectEmployee').value = '';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('confirmPassword').value = '';
            document.getElementById('selectRole').value = '';
            addUserModal.style.display = 'none';
        } catch (err) {
            console.error('Lỗi khi thêm user:', err);
            errorAlert.textContent = err.message || 'Lỗi khi thêm tài khoản!';
            errorAlert.style.display = 'block';
            setTimeout(() => { errorAlert.style.display = 'none'; }, 1200);
        }
    });

    // Event listeners for view user modal
    closeViewUserModal.addEventListener('click', () => {
        viewUserModal.style.display = 'none';
    });

    cancelViewUserModal.addEventListener('click', () => {
        viewUserModal.style.display = 'none';
    });

    viewUserModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            viewUserModal.style.display = 'none';
        }
    });

    // Event listener for "Xem tất cả"
    viewAllBtn.addEventListener('click', () => {
        displayUsers();
        document.querySelectorAll('.role-item').forEach(item => item.classList.remove('active'));
        document.querySelector('.role-list').firstElementChild.classList.add('active');
    });

    // Khi load trang, hiển thị danh sách user
    (async () => { await displayUsers(); })();
});
