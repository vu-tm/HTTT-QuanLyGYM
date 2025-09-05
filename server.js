const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const cors = require("cors");
const moment = require("moment-timezone");
const path = require('path');

const app = express();
const router = express.Router();

const allowedOrigins = ['http://127.0.0.1:5501', 'http://localhost:5501'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Phục vụ file HTML
app.use('/', express.static(path.join(__dirname)));
app.use('/api', router);

// Kết nối SQL Server
const config = {
  user: "viet",
  password: "123456",
  server: "INSPIRON-5420",
  database: "QLGym",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    charset: "UTF-8",
  },
};

let pool; // Biến toàn cục để lưu trữ kết nối

// Kết nối cơ sở dữ liệu
sql.connect(config)
  .then((connectionPool) => {
    pool = connectionPool;
    console.log("Kết nối SQL Server thành công!");
  })
  .catch((err) => {
    console.error("Lỗi kết nối SQL Server:", err);
  });

// Route mặc định
app.get("/", (req, res) => {
  res.send("Chào mừng đến với API ");
});

// Lấy danh sách nhân viên (tất cả)
router.get('/employees/all', async (req, res) => {
    try {
        console.log('Connecting to database...');
        await sql.connect(config);
        console.log('Connected successfully');
        
        console.log('Executing query...');
        const result = await sql.query`
            SELECT e.*, s.scheduleName, s.startDate, s.endDate, s.cycle
            FROM employees e
            LEFT JOIN shifts s ON e.code = s.employee_code
        `;
        console.log('Query executed successfully');
        console.log('Number of records:', result.recordset.length);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error details:', err);
        res.status(500).send('Server Error');
    }
});


// Thêm nhân viên mới
router.post('/employees', async (req, res) => {
    try {
        await sql.connect(config);
        const { code, name, phone, email, address, dob, sex, status, contractType, salary, position, photo } = req.body;

        const codeNormalized = code.trim().toUpperCase();
        const check = await sql.query`SELECT code FROM employees WHERE UPPER(LTRIM(RTRIM(code))) = ${codeNormalized}`;
        console.log('Mã nhân viên gửi lên:', code, '| Normalized:', codeNormalized);
        console.log('Kết quả kiểm tra trùng:', check.recordset);
        if (check.recordset.length > 0) {
            return res.status(400).send('Mã nhân viên đã tồn tại. Vui lòng nhập mã khác!');
        }

        if (!code || !name || !dob || !sex || !phone || !address || !status || !contractType || !salary) {
            return res.status(400).send('Vui lòng nhập đầy đủ thông tin bắt buộc!');
        }
        if (isNaN(salary) || salary <= 0) {
            return res.status(400).send('Mức lương phải là số nguyên dương!');
        }

        await sql.query`
            INSERT INTO employees (code, name, phone, email, address, dob, sex, status, contractType, salary, position, photo)
            VALUES (${code}, ${name}, ${phone}, ${email}, ${address}, ${dob}, ${sex}, ${status}, ${contractType}, ${salary}, ${position}, ${photo})
        `;

        res.json({ success: true });
    } catch (err) {
        // Xử lý lỗi trùng mã (nếu có constraint khác)
        if (err.originalError && err.originalError.info && err.originalError.info.message.includes('UNIQUE KEY')) {
            return res.status(400).send('Mã nhân viên đã tồn tại. Vui lòng nhập mã khác!');
        }
        // Lỗi chung
    }
});

// Xóa nhân viên
router.delete('/employees/:code', async (req, res) => {
    try {
        console.log('Connecting to database...');
        await sql.connect(config);
        console.log('Connected successfully');
        
        const { code } = req.params;
        console.log('Deleting employee with code:', code);
        
        // Xóa ca làm việc trước
        const deleteShifts = await sql.query`
            DELETE FROM shifts WHERE employee_code = ${code}
        `;
        console.log('Deleted shifts:', deleteShifts.rowsAffected);
        
        // Sau đó xóa nhân viên
        const deleteEmployee = await sql.query`
            DELETE FROM employees WHERE code = ${code}
        `;
        console.log('Deleted employee:', deleteEmployee.rowsAffected);
        
        if (deleteEmployee.rowsAffected[0] === 0) {
            return res.status(404).send('Không tìm thấy nhân viên để xóa!');
        }
        
        res.json({ 
            success: true,
            message: 'Xóa nhân viên  ',
            deletedShifts: deleteShifts.rowsAffected[0],
            deletedEmployee: deleteEmployee.rowsAffected[0]
        });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).send('Không thể xóa nhân viên. Vui lòng thử lại sau!');
    }
});

// Kiểm tra kết nối database
router.get('/test-connection', async (req, res) => {
    try {
        console.log('Testing database connection...');
        await sql.connect(config);
        console.log('Connected successfully');
        
        const result = await sql.query`SELECT COUNT(*) as count FROM employees`;
        console.log('Number of employees:', result.recordset[0].count);
        
        res.json({ 
            success: true, 
            message: 'Database connection successful',
            employeeCount: result.recordset[0].count
        });
    } catch (err) {
        console.error('Connection test error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed',
            error: err.message 
        });
    }
});

// API: Lấy danh sách ca làm
router.get('/shifts', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query(`
            SELECT s.code, s.employee_code, e.name as employeeName, s.scheduleName, 
                   FORMAT(s.startDate, 'dd/MM/yyyy') as startDate, 
                   FORMAT(s.endDate, 'dd/MM/yyyy') as endDate, 
                   s.cycle, s.status
            FROM shifts s
            JOIN employees e ON s.employee_code = e.code
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Lỗi lấy danh sách ca làm');
    }
});

// API: Thêm ca làm
router.post('/shifts', async (req, res) => {
    try {
        await sql.connect(config);
        const { employeeCode, scheduleName, startDate, endDate, cycle } = req.body;
        // Tạo code mới cho ca làm (ví dụ: SH016)
        const codeResult = await sql.query`SELECT TOP 1 code FROM shifts ORDER BY code DESC`;
        let newCode = 'SH001';
        if (codeResult.recordset.length > 0) {
            const lastCode = codeResult.recordset[0].code;
            const num = parseInt(lastCode.replace('SH', '')) + 1;
            newCode = 'SH' + num.toString().padStart(3, '0');
        }
        await sql.query`
            INSERT INTO shifts (code, employee_code, scheduleName, startDate, endDate, cycle, status)
            VALUES (${newCode}, ${employeeCode}, ${scheduleName}, ${startDate}, ${endDate}, ${cycle}, N'Đang hoạt động')
        `;
        res.json({ success: true, code: newCode });
    } catch (err) {
        res.status(500).send('Lỗi thêm ca làm');
    }
});

// API: Xóa ca làm
router.delete('/shifts/:code', async (req, res) => {
    try {
        await sql.connect(config);
        const { code } = req.params;
        await sql.query`DELETE FROM shifts WHERE code = ${code}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Lỗi xóa ca làm');
    }
});

// API: Lấy danh sách tài khoản người dùng
router.get('/users', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT * FROM users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Lỗi lấy danh sách tài khoản người dùng');
    }
});

// API: Thêm tài khoản người dùng
router.post('/users', async (req, res) => {
    try {
        await sql.connect(config);
        const { username, password, role, approvalStatus, locked, createdAt, employee } = req.body;
        // Kiểm tra trùng username
        const check = await sql.query`SELECT username FROM users WHERE username = ${username}`;
        if (check.recordset.length > 0) {
            return res.status(400).send('Tên đăng nhập đã tồn tại!');
        }
        await sql.query`
            INSERT INTO users (username, password, role, approvalStatus, locked, createdAt, employee_code)
            VALUES (${username}, ${password}, ${role}, ${approvalStatus}, ${locked}, ${createdAt}, ${employee})
        `;
        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi chi tiết khi thêm user:', err);
        res.status(500).send('Lỗi thêm tài khoản người dùng');
    }
});

// API: Xóa tài khoản người dùng
router.delete('/users/:username', async (req, res) => {
    try {
        await sql.connect(config);
        const { username } = req.params;
        await sql.query`DELETE FROM users WHERE username = ${username}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Lỗi xóa tài khoản người dùng');
    }
});

// API: Cập nhật trạng thái khóa/mở tài khoản người dùng
router.put('/users/:username', async (req, res) => {
    try {
        await sql.connect(config);
        const { username } = req.params;
        const { locked } = req.body;
        await sql.query`UPDATE users SET locked = ${locked} WHERE username = ${username}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Lỗi cập nhật trạng thái khóa tài khoản');
    }
});

// API: Đăng nhập
app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT * FROM users 
        WHERE username = @username 
          AND password = @password
          AND approvalStatus = N'Đã phê duyệt'
          AND (locked IS NULL OR locked = 0)
      `);
    if (result.recordset.length === 1) {
      const user = result.recordset[0];
      res.json({
        success: true,
        user: {
          username: user.username,
          role: user.role,
          employeeCode: user.employeeCode
        }
      });
    } else {
      res.json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu, hoặc tài khoản bị khóa/chưa được phê duyệt' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', details: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT * FROM users 
        WHERE username = @username 
          AND password = @password
          AND approvalStatus = N'Đã phê duyệt'
          AND (locked IS NULL OR locked = 0)
      `);
    if (result.recordset.length === 1) {
      const user = result.recordset[0];
      res.json({
        success: true,
        user: {
          username: user.username,
          role: user.role,
          employeeCode: user.employeeCode
        }
      });
    } else {
      res.json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu, hoặc tài khoản bị khóa/chưa được phê duyệt' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', details: err.message });
  }
});

// Tách riêng API cho khách hàng
const customerRouter = express.Router();
app.use('/api/customers', customerRouter);

// Lấy danh sách khách hàng
customerRouter.get('/', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT c.code, c.name, c.birthdate, c.gender, c.address, c.phone,
             cp.code AS customer_package_code, -- Thêm trường này
             cp.package_code, pk.name AS packageName,
             cp.start_date, cp.end_date, cp.status AS packageStatus
      FROM customers c
      LEFT JOIN (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_code ORDER BY end_date DESC) AS rn
        FROM customer_packages
      ) cp ON c.code = cp.customer_code AND cp.rn = 1
      LEFT JOIN packages pk ON cp.package_code = pk.code
      ORDER BY c.code
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách khách hàng:', err.message);
    res.status(500).send(err.message);
  }
});

// Tìm kiếm khách hàng
customerRouter.get('/search', async (req, res) => {
  const { name } = req.query;
  try {
    let query = `
      SELECT c.code, c.name, c.birthdate, c.gender, c.address, c.phone,
             cp.code AS customer_package_code,
             cp.package_code, pk.name AS packageName,
             cp.start_date, cp.end_date, cp.status AS packageStatus
      FROM customers c
      LEFT JOIN (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_code ORDER BY end_date DESC) AS rn
        FROM customer_packages
      ) cp ON c.code = cp.customer_code AND cp.rn = 1
      LEFT JOIN packages pk ON cp.package_code = pk.code
      WHERE 1=1
    `;
    if (name) query += ` AND c.name LIKE '%${name}%'`;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi tìm kiếm khách hàng:', err.message);
    res.status(500).send(err.message);
  }
});

// Thêm khách hàng mới
customerRouter.post('/', async (req, res) => {
  try {
    const { name, birthdate, gender, address, phone } = req.body; // Xóa cardType, startDate, status
    
    // Tạo mã khách hàng mới
    const codeResult = await pool.request().query('SELECT TOP 1 code FROM customers ORDER BY code DESC');
    let newCode = 'KH001';
    if (codeResult.recordset.length > 0) {
      const lastCode = codeResult.recordset[0].code;
      const num = parseInt(lastCode.replace('KH', '')) + 1;
      newCode = 'KH' + num.toString().padStart(3, '0');
    }

    await pool.request()
      .input('code', newCode)
      .input('name', name)
      .input('birthdate', birthdate)
      .input('gender', gender)
      .input('address', address)
      .input('phone', phone)
      // Xóa input cho cardType, startDate, status
      .query(`
        INSERT INTO customers (code, name, birthdate, gender, address, phone)
        VALUES (@code, @name, @birthdate, @gender, @address, @phone)
      `); // Xóa cardType, startDate, status khỏi câu lệnh INSERT
    
    res.json({ success: true, code: newCode });
  } catch (err) {
    console.error('Lỗi khi thêm khách hàng:', err.message);
    res.status(500).send(err.message);
  }
});

// Sửa khách hàng (KHÔNG có trường status)
customerRouter.put('/:code', async (req, res) => {
  try {
    const { name, birthdate, gender, address, phone } = req.body;
    await pool.request()
      .input('code', sql.VarChar, req.params.code)
      .input('name', sql.NVarChar, name)
      .input('birthdate', sql.Date, birthdate)
      .input('gender', sql.NVarChar, gender)
      .input('address', sql.NVarChar, address)
      .input('phone', sql.VarChar, phone)
      .query(`
        UPDATE customers
        SET name=@name, birthdate=@birthdate, gender=@gender, address=@address, phone=@phone
        WHERE code=@code
      `);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa khách hàng
customerRouter.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    await pool.request()
      .input('code', code)
      .query('DELETE FROM customers WHERE code = @code');
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi khi xóa khách hàng:', err.message);
    res.status(500).send(err.message);
  }
});

// API: Lấy danh sách gói tập
app.get('/api/packages', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM packages');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm gói tập
app.post('/api/packages', async (req, res) => {
    try {
        const { code, name, duration, price } = req.body;
        await pool.request()
            .input('code', sql.VarChar, code)
            .input('name', sql.NVarChar, name)
            .input('duration', sql.Int, duration)
            .input('price', sql.Money, price)
            .query('INSERT INTO packages (code, name, duration, price) VALUES (@code, @name, @duration, @price)');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sửa gói tập
app.put('/api/packages/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { name, duration, price } = req.body;
        await pool.request()
            .input('code', sql.VarChar, code)
            .input('name', sql.NVarChar, name)
            .input('duration', sql.Int, duration)
            .input('price', sql.Money, price)
            .query('UPDATE packages SET name=@name, duration=@duration, price=@price WHERE code=@code');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa gói tập
app.delete('/api/packages/:code', async (req, res) => {
    try {
        const { code } = req.params;
        await pool.request()
            .input('code', sql.VarChar, code)
            .query('DELETE FROM packages WHERE code=@code');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Thêm gói tập cho khách hàng
app.post('/api/customer_packages', async (req, res) => {
  try {
    const { customer_code, package_code, start_date, end_date, status } = req.body;
    // Tạo mã code mới cho customer_packages
    const codeResult = await pool.request().query('SELECT TOP 1 code FROM customer_packages ORDER BY code DESC');
    let newCode = 'CP001';
    if (codeResult.recordset.length > 0) {
      const lastCode = codeResult.recordset[0].code;
      const num = parseInt(lastCode.replace('CP', '')) + 1;
      newCode = 'CP' + num.toString().padStart(3, '0');
    }
    await pool.request()
      .input('code', newCode)
      .input('customer_code', customer_code)
      .input('package_code', package_code)
      .input('start_date', start_date)
      .input('end_date', end_date)
      .input('status', status)
      .query(`
        INSERT INTO customer_packages (code, customer_code, package_code, start_date, end_date, status)
        VALUES (@code, @customer_code, @package_code, @start_date, @end_date, @status)
      `);
    res.json({ success: true, code: newCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Cập nhật gói tập cho khách hàng
app.put('/api/customer_packages/:code', async (req, res) => {
    try {
        const { code } = req.params; // Mã của customer_packages
        const { package_code, start_date, end_date, status } = req.body;

        await pool.request()
            .input('code', sql.VarChar, code)
            .input('package_code', sql.VarChar, package_code)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .input('status', sql.NVarChar, status)
            .query(`
                UPDATE customer_packages
                SET package_code = @package_code,
                    start_date = @start_date,
                    end_date = @end_date,
                    status = @status
                WHERE code = @code
            `);

        res.json({ success: true });

    } catch (err) {
        console.error('Lỗi khi cập nhật gói tập khách hàng:', err.message);
        res.status(500).json({ error: 'Failed to update customer package', details: err.message });
    }
});

// API: Lấy danh sách PT (chỉ lấy HLV còn làm)
app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT code, name, phone, status
      FROM employees
      WHERE position = N'Huấn luyện viên' AND status = N'Đang làm'
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API: Tìm kiếm PT theo tên (chỉ lấy HLV còn làm)
app.get("/api/employees/search", async (req, res) => {
  const { name } = req.query;
  try {
    let query = `
      SELECT code, name, phone, status 
      FROM employees 
      WHERE position = N'Huấn luyện viên' AND status = N'Đang làm'
    `;
    if (name) query += ` AND name LIKE '%${name}%'`;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API: Thêm PT
app.post("/api/employees", async (req, res) => {
  const { name, phone, status } = req.body;

  try {
    // Tạo mã nhân viên mới
    const codeResult = await pool.request().query('SELECT TOP 1 code FROM employees ORDER BY code DESC');
    let newCode = 'NV001';
    if (codeResult.recordset.length > 0) {
      const lastCode = codeResult.recordset[0].code;
      const num = parseInt(lastCode.replace('NV', '')) + 1;
      newCode = 'NV' + num.toString().padStart(3, '0');
    }

    await pool.request()
      .input("code", sql.VarChar, newCode)
      .input("name", sql.NVarChar, name)
      .input("phone", sql.NVarChar, phone)
      .input("status", sql.NVarChar, status)
      .input("position", sql.NVarChar, "Huấn luyện viên")
      .query(`
        INSERT INTO employees (code, name, phone, status, position)
        VALUES (@code, @name, @phone, @status, @position)
      `);

    res.send("Thêm PT thành công!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API: Xóa PT và các lịch tập liên quan
app.delete("/api/employees/:code", async (req, res) => {
  const { code } = req.params;
  try {
    // Xóa các lịch tập liên quan
    await pool.request()
      .input("code", sql.VarChar, code)
      .query("DELETE FROM schedules WHERE employee_code = @code");

    // Xóa PT
    await pool.request()
      .input("code", sql.VarChar, code)
      .query("DELETE FROM employees WHERE code = @code AND position = N'Huấn luyện viên'");

    res.send("Xóa PT và các lịch tập liên quan thành công!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API: Lấy danh sách lịch tập (áp dụng cho mọi API GET schedules)
app.get("/api/schedules", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Cập nhật trạng thái "Hoàn thành" cho các ca đã qua ngày hôm nay
    await pool.request().query(`
      UPDATE schedules
      SET status = N'Hoàn thành'
      WHERE scheduleDate < CAST(GETDATE() AS DATE) AND status != N'Hoàn thành'
    `);

    const result = await pool.request()
      .input("startDate", sql.Date, startDate)
      .input("endDate", sql.Date, endDate)
      .query(`
        SELECT 
          s.code,
          c.name AS MemberName, 
          e.name AS TrainerName, 
          s.scheduleDate, 
          s.startHour, 
          s.endHour,
          s.status
        FROM schedules s
        LEFT JOIN customers c ON s.customer_code = c.code
        LEFT JOIN employees e ON s.employee_code = e.code
        WHERE s.scheduleDate >= @startDate AND s.scheduleDate <= @endDate
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi khi lấy lịch tập:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Lấy danh sách lịch tập cho QLcatap
app.get('/api/schedules/qlcatap', async (req, res) => {
  try {
    // Cập nhật trạng thái "Hoàn thành" cho các ca đã qua ngày hôm nay
    await pool.request().query(`
      UPDATE schedules
      SET status = N'Hoàn thành'
      WHERE scheduleDate < CAST(GETDATE() AS DATE) AND status != N'Hoàn thành'
    `);

    // Sau đó lấy danh sách ca tập
    const result = await pool.request().query(`
      SELECT s.*, c.name AS MemberName, e.name AS TrainerName
      FROM schedules s
      LEFT JOIN customers c ON s.customer_code = c.code
      LEFT JOIN employees e ON s.employee_code = e.code
      ORDER BY s.scheduleDate DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách ca tập:', err); // Thêm dòng này để xem lỗi chi tiết
    res.status(500).send('Lỗi lấy danh sách ca tập');
  }
});

// API: Thêm lịch tập
app.post("/api/schedules", async (req, res) => {
  const { memberID, trainerID, scheduleDate, startHour, duration, status } = req.body;

  try {
    // Kiểm tra trùng lịch
    const conflictCheck = await pool.request()
      .input("trainerID", sql.VarChar, trainerID)
      .input("scheduleDate", sql.Date, scheduleDate)
      .input("startHour", sql.Int, startHour)
      .input("endHour", sql.Int, parseInt(startHour, 10) + parseInt(duration, 10))
      .query(`
        SELECT * 
        FROM schedules
        WHERE employee_code = @trainerID
          AND scheduleDate = @scheduleDate
          AND (
            (startHour < @endHour AND endHour > @startHour)
          )
      `);

    if (conflictCheck.recordset.length > 0) {
      return res.status(400).send("Lịch tập bị trùng!");
    }

    // Tạo mã lịch tập mới
    const codeResult = await pool.request().query('SELECT TOP 1 code FROM schedules ORDER BY code DESC');
    let newCode = 'SCH001';
    if (codeResult.recordset.length > 0) {
      const lastCode = codeResult.recordset[0].code;
      const num = parseInt(lastCode.replace('SCH', '')) + 1;
      newCode = 'SCH' + num.toString().padStart(3, '0');
    }

    // Thêm lịch tập
    await pool.request()
      .input("code", sql.VarChar, newCode)
      .input("customer_code", sql.VarChar, memberID)
      .input("employee_code", sql.VarChar, trainerID)
      .input("scheduleDate", sql.Date, scheduleDate)
      .input("startHour", sql.Int, startHour)
      .input("endHour", sql.Int, parseInt(startHour, 10) + parseInt(duration, 10))
      .input("status", sql.NVarChar, status)
      .query(`
        INSERT INTO schedules (code, customer_code, employee_code, scheduleDate, startHour, endHour, status)
        VALUES (@code, @customer_code, @employee_code, @scheduleDate, @startHour, @endHour, @status)
      `);

    res.send("Lịch tập đã được lưu!");
  } catch (err) {
    console.error("Lỗi khi thêm lịch tập:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Xóa lịch tập
app.delete("/api/schedules/:code", async (req, res) => {
  const { code } = req.params;
  try {
    await pool.request()
      .input("code", sql.VarChar, code)
      .query("DELETE FROM schedules WHERE code = @code");
    res.json({ message: "Xóa ca tập thành công!" });
  } catch (err) {
    console.error("Lỗi khi xóa lịch tập:", err);
    res.status(500).send(err.message);
  }
});

// Hàm tải lịch tập
async function fetchSchedules() {
  try {
    const currentDate = new Date(); // Ngày hiện tại
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay(); // Lấy thứ trong tuần (0: Chủ nhật, 1: Thứ 2, ...)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là Chủ nhật, lùi về Thứ 2 tuần hiện tại
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday); // Lùi về Thứ 2

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Chủ nhật

    console.log("startOfWeek:", startOfWeek.toISOString(), "endOfWeek:", endOfWeek.toISOString());

    const response = await fetch(
      `http://localhost:5000/api/schedules?startDate=${startOfWeek.toISOString()}&endDate=${endOfWeek.toISOString()}`
    );
    const schedules = await response.json();
    console.log("Dữ liệu lịch tập:", schedules); // Kiểm tra dữ liệu trả về
    renderSchedules(schedules); // Hiển thị dữ liệu trong bảng
  } catch (error) {
    console.error("Lỗi khi tải lịch tập:", error);
  }
}

// API: Lấy danh sách hóa đơn
app.get("/api/invoices", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT i.*, id.code as detail_code, id.product_code, id.package_code, 
             id.quantity, id.price, id.name as item_name,
             p.name as product_name, pk.name as package_name
      FROM invoices i
      LEFT JOIN invoice_details id ON i.code = id.invoice_code
      LEFT JOIN products p ON id.product_code = p.code
      LEFT JOIN packages pk ON id.package_code = pk.code
      ORDER BY i.time DESC
    `);

    // Group items by invoice
    const invoices = {};
    result.recordset.forEach(row => {
      if (!invoices[row.code]) {
        invoices[row.code] = {
          code: row.code,
          time: row.time,
          customerName: row.customerName,
          phone: row.phone,
          totalAmount: row.totalAmount,
          status: row.status,
          type: row.type,
          paymentMethod: row.paymentMethod,
          employee_code: row.employee_code,
          items: []
        };
      }
      if (row.detail_code) {
        invoices[row.code].items.push({
          code: row.detail_code,
          product_code: row.product_code,
          package_code: row.package_code,
          name: row.item_name || row.product_name || row.package_name,
          quantity: row.quantity,
          price: row.price
        });
      }
    });

    res.json(Object.values(invoices));
  } catch (err) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Lấy chi tiết hóa đơn
app.get("/api/invoices/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.request()
      .input("code", sql.VarChar, code)
      .query(`
        SELECT i.*, id.code as detail_code, id.product_code, id.package_code, 
               id.quantity, id.price, id.name as item_name,
               p.name as product_name, pk.name as package_name
        FROM invoices i
        LEFT JOIN invoice_details id ON i.code = id.invoice_code
        LEFT JOIN products p ON id.product_code = p.code
        LEFT JOIN packages pk ON id.package_code = pk.code
        WHERE i.code = @code
      `);

    if (result.recordset.length === 0) {
      return res.status(404).send("Không tìm thấy hóa đơn");
    }

    // Format invoice with items
    const invoice = {
      code: result.recordset[0].code,
      time: result.recordset[0].time,
      customerName: result.recordset[0].customerName,
      phone: result.recordset[0].phone,
      totalAmount: result.recordset[0].totalAmount,
      status: result.recordset[0].status,
      type: result.recordset[0].type,
      paymentMethod: result.recordset[0].paymentMethod,
      items: result.recordset.map(row => ({
        code: row.detail_code,
        product_code: row.product_code,
        package_code: row.package_code,
        name: row.item_name || row.product_name || row.package_name,
        quantity: row.quantity,
        price: row.price
      })).filter(item => item.code)
    };

    res.json(invoice);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết hóa đơn:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Thêm hóa đơn mới
app.post("/api/invoices", async (req, res) => {
  try {
    console.log('DỮ LIỆU NHẬN ĐƯỢC:', req.body);
    const { code, customerName, phone, totalAmount, status, type, paymentMethod, items, employee_code } = req.body;
    
    // Tạo mã hóa đơn mới nếu không được cung cấp
    let invoiceCode = code;
    if (!invoiceCode) {
      const codeResult = await pool.request().query('SELECT TOP 1 code FROM invoices ORDER BY code DESC');
      invoiceCode = 'HD001';
      if (codeResult.recordset.length > 0) {
        const lastCode = codeResult.recordset[0].code;
        const num = parseInt(lastCode.replace('HD', '')) + 1;
        invoiceCode = 'HD' + num.toString().padStart(3, '0');
      }
    }

    // Thêm hóa đơn
    await pool.request()
      .input("code", sql.VarChar, invoiceCode)
      .input("time", sql.Date, new Date())
      .input("customerName", sql.NVarChar, customerName)
      .input("phone", sql.VarChar, phone || '')
      .input("totalAmount", sql.Decimal, totalAmount)
      .input("status", sql.NVarChar, status)
      .input("type", sql.NVarChar, type)
      .input("paymentMethod", sql.NVarChar, paymentMethod)
      .input("employee_code", sql.VarChar, employee_code)
      .query(`
        INSERT INTO invoices (code, time, customerName, phone, totalAmount, status, type, paymentMethod, employee_code)
        VALUES (@code, @time, @customerName, @phone, @totalAmount, @status, @type, @paymentMethod, @employee_code)
      `);

    // Thêm chi tiết hóa đơn
    if (items && items.length > 0) {
      const result = await pool.request().query('SELECT TOP 1 code FROM invoice_details ORDER BY code DESC');
      let lastCode = result.recordset.length > 0 ? result.recordset[0].code : 'CT000';
      let lastNum = parseInt(lastCode.replace('CT', '')) || 0;

      for (const item of items) {
        lastNum++;
        const detailCode = 'CT' + String(lastNum).padStart(3, '0');
        await pool.request()
          .input("code", sql.VarChar, detailCode)
          .input("invoice_code", sql.VarChar, invoiceCode)
          .input("product_code", sql.VarChar, item.product_code)
          .input("package_code", sql.VarChar, item.package_code)
          .input("quantity", sql.Int, item.quantity)
          .input("price", sql.Decimal, item.price)
          .input("name", sql.NVarChar, item.name)
          .query(`
            INSERT INTO invoice_details (code, invoice_code, product_code, package_code, quantity, price, name)
            VALUES (@code, @invoice_code, @product_code, @package_code, @quantity, @price, @name)
          `);
      }
    }

    // Sau khi insert từng item vào invoice_details
    if (status === 'Hoàn thành' && type === 'Bán hàng' && Array.isArray(items)) {
        for (const item of items) {
            if (item.product_code) {
                // Trừ số lượng tồn kho sản phẩm
                await pool.request()
                    .input('code', sql.VarChar, item.product_code)
                    .input('qty', sql.Int, item.quantity)
                    .query('UPDATE products SET stock = stock - @qty WHERE code = @code');
            }
        }
    }

    res.json({ success: true, code: invoiceCode });
  } catch (err) {
    console.error("Lỗi khi thêm hóa đơn:", err.message);
    res.status(500).json({ error: "Failed to save invoice", details: err.message });
  }
});

// API: Cập nhật hóa đơn
app.put('/api/invoices/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { totalAmount, status, type, paymentMethod, items, employee_code } = req.body;

        // LẤY TRẠNG THÁI CŨ TRƯỚC KHI UPDATE
        const oldInvoice = await pool.request()
            .input('code', sql.VarChar, code)
            .query('SELECT status, type FROM invoices WHERE code = @code');
        const oldStatus = oldInvoice.recordset[0]?.status;
        const oldType = oldInvoice.recordset[0]?.type;

        // Cập nhật thông tin hóa đơn
        await pool.request()
            .input('code', sql.VarChar, code)
            .input('totalAmount', sql.Money, totalAmount)
            .input('status', sql.NVarChar, status)
            .input('type', sql.NVarChar, type)
            .input('paymentMethod', sql.NVarChar, paymentMethod)
            .input('employee_code', sql.VarChar, employee_code)
            .query(`
                UPDATE invoices
                SET totalAmount = @totalAmount,
                    status = @status,
                    type = @type,
                    paymentMethod = @paymentMethod,
                    employee_code = @employee_code
                WHERE code = @code
            `);

        // Xóa và thêm lại danh sách sản phẩm hóa đơn (nếu có bảng invoice_details)
        if (Array.isArray(items)) {
            await pool.request()
                .input('code', sql.VarChar, code)
                .query(`DELETE FROM invoice_details WHERE invoice_code = @code`);
            // Lấy mã code cuối cùng của invoice_details
            const result = await pool.request().query('SELECT TOP 1 code FROM invoice_details ORDER BY code DESC');
            let lastCode = result.recordset.length > 0 ? result.recordset[0].code : 'CT000';
            let lastNum = parseInt(lastCode.replace('CT', '')) || 0;

            for (const item of items) {
                lastNum++;
                const detailCode = 'CT' + String(lastNum).padStart(3, '0');
                await pool.request()
                    .input('code', sql.VarChar, detailCode)
                    .input('invoice_code', sql.VarChar, code)
                    .input('product_code', sql.VarChar, item.product_code)
                    .input('package_code', sql.VarChar, item.package_code)
                    .input('name', sql.NVarChar, item.name)
                    .input('quantity', sql.Int, item.quantity)
                    .input('price', sql.Money, item.price)
                    .query(`
                        INSERT INTO invoice_details (code, invoice_code, product_code, package_code, name, quantity, price)
                        VALUES (@code, @invoice_code, @product_code, @package_code, @name, @quantity, @price)
                    `);
            }
        }

        // Sau khi update invoices và insert lại invoice_details
        // Kiểm tra nếu status mới là 'Hoàn thành' và trước đó chưa phải 'Hoàn thành'
        if (status === 'Hoàn thành' && type === 'Bán hàng' && oldStatus !== 'Hoàn thành' && Array.isArray(items)) {
            for (const item of items) {
                if (item.product_code) {
                    await pool.request()
                        .input('code', sql.VarChar, item.product_code)
                        .input('qty', sql.Int, item.quantity)
                        .query('UPDATE products SET stock = stock - @qty WHERE code = @code');
                }
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi cập nhật hóa đơn:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// API: Xóa hóa đơn
app.delete("/api/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Xóa chi tiết sản phẩm
    await pool.request()
      .input("invoiceCode", sql.VarChar, id)
      .query("DELETE FROM invoice_products WHERE invoice_code = @invoiceCode");

    // Xóa hóa đơn
    await pool.request()
      .input("code", sql.VarChar, id)
      .query("DELETE FROM invoices WHERE code = @code");

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi khi xóa hóa đơn:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT code, name, sellPrice, buyPrice, stock, status, image
      FROM products
      WHERE isDeleted = 0
      ORDER BY name
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err.message);
    res.status(500).send(err.message);
  }
});
// API: Lấy danh sách sản phẩm ĐANG BÁN (không lấy sản phẩm ngừng bán)
app.get('/api/products/active', async (req, res) => {
    try {
        const result = await pool.request().query(
            "SELECT * FROM products WHERE status = N'Đang bán'"
        );
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});
// API: Tìm kiếm sản phẩm theo tên
app.get('/api/products/search', async (req, res) => {
  const { name } = req.query;
  try {
    let query = `
      SELECT code, name, sellPrice, buyPrice, stock, status, image 
      FROM products 
      WHERE 1=1
    `;
    if (name) query += ` AND name LIKE '%${name}%'`;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', err.message);
    res.status(500).send(err.message);
  }
});

// API: Thêm sản phẩm mới
app.post("/api/products", async (req, res) => {
  try {
    const { code, name, sellPrice, buyPrice, status, image } = req.body;

    await pool.request()
      .input('code', sql.VarChar, code)
      .input('name', sql.NVarChar, name)
      .input('sellPrice', sql.Money, sellPrice)
      .input('buyPrice', sql.Money, buyPrice)
      .input('stock', sql.Int, 0) // tồn kho mặc định 0
      .input('status', sql.NVarChar, status || 'Đang bán')
      .input('image', sql.NVarChar, image || '')
      .query(`
        INSERT INTO products (code, name, sellPrice, buyPrice, stock, status, image)
        VALUES (@code, @name, @sellPrice, @buyPrice, @stock, @status, @image)
      `);

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Cập nhật sản phẩm
app.put('/api/products/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { name, buyPrice, sellPrice, status, image } = req.body;
        await pool.request()
            .input('code', sql.VarChar, code)
            .input('name', sql.NVarChar, name)
            .input('buyPrice', sql.Money, buyPrice)
            .input('sellPrice', sql.Money, sellPrice)
            .input('status', sql.NVarChar, status)
            .input('image', sql.NVarChar, image)
            .query(`
                UPDATE products
                SET name = @name,
                    buyPrice = @buyPrice,
                    sellPrice = @sellPrice,
                    status = @status,
                    image = @image
                WHERE code = @code
            `);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Xóa sản phẩm (ẩn mềm nếu bị lỗi khóa ngoại)
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.request()
      .input("code", sql.VarChar, id)
      .query("DELETE FROM products WHERE code = @code");
    res.json({ success: true });
  } catch (err) {
    // Nếu lỗi liên quan đến REFERENCE constraint thì ẩn mềm
    if (err.message && err.message.includes("REFERENCE constraint")) {
      try {
        await pool.request()
          .input("code", sql.VarChar, req.params.id)
          .query("UPDATE products SET isDeleted = 1 WHERE code = @code");
        return res.json({ success: true, hidden: true, message: "Sản phẩm đã được ẩn khỏi hệ thống!" });
      } catch (hideErr) {
        return res.status(500).json({ success: false, message: "Không thể ẩn sản phẩm!", details: hideErr.message });
      }
    }
    console.error("Lỗi khi xóa sản phẩm:", err.message);
    res.status(500).send(err.message);
  }
});

// Ẩn sản phẩm (ẩn mềm)
router.put('/api/products/:code/hide', async (req, res) => {
    try {
        await pool.request()
            .input('code', sql.VarChar, req.params.code)
            .query('UPDATE products SET isDeleted = 1 WHERE code = @code');
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// API: Lấy danh sách nhà cung cấp
app.get("/api/suppliers", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT * FROM suppliers
      ORDER BY name
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách nhà cung cấp:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Thêm nhà cung cấp mới
app.post("/api/suppliers", async (req, res) => {
  try {
    const { name, address, phone, email} = req.body;
    
    // Tạo mã nhà cung cấp mới
    const codeResult = await pool.request().query('SELECT TOP 1 code FROM suppliers ORDER BY code DESC');
    let newCode = 'NCC001';
    if (codeResult.recordset.length > 0) {
      const lastCode = codeResult.recordset[0].code;
      const num = parseInt(lastCode.replace('NCC', '')) + 1;
      newCode = 'NCC' + num.toString().padStart(3, '0');
    }

    await pool.request()
      .input("code", sql.VarChar, newCode)
      .input("name", sql.NVarChar, name)
      .input("address", sql.NVarChar, address)
      .input("phone", sql.NVarChar, phone)
      .input("email", sql.NVarChar, email)
      .query(`
        INSERT INTO suppliers (code, name, address, phone, email)
        VALUES (@code, @name, @address, @phone, @email)
      `);
    
    res.json({ success: true, code: newCode });
  } catch (err) {
    console.error("Lỗi khi thêm nhà cung cấp:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Cập nhật nhà cung cấp
app.put("/api/suppliers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email } = req.body;

    await pool.request()
      .input("code", sql.VarChar, id)
      .input("name", sql.NVarChar, name)
      .input("address", sql.NVarChar, address)
      .input("phone", sql.NVarChar, phone)
      .input("email", sql.NVarChar, email)
      .query(`
        UPDATE suppliers 
        SET name = @name,
            address = @address,
            phone = @phone,
            email = @email
        WHERE code = @code
      `);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi khi cập nhật nhà cung cấp:", err.message);
    res.status(500).send(err.message);
  }
});

// API: Xóa nhà cung cấp
app.delete("/api/suppliers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.request()
      .input("code", sql.VarChar, id)
      .query("DELETE FROM suppliers WHERE code = @code");
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi khi xóa nhà cung cấp:", err.message);
    res.status(500).send(err.message);
  }
});

// GET /api/imports?page=1&limit=10
router.get('/imports', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000; // Tăng limit để lấy đủ dữ liệu cho báo cáo
        const offset = (page - 1) * limit;
        const { startDate, endDate } = req.query; // Lấy startDate và endDate từ query params

        console.log('Backend received date range:', { startDate, endDate }); // Log received dates

        // Lấy tổng số phiếu nhập (có thể cần lọc theo ngày nếu muốn tổng số trong khoảng thời gian)
        // Hiện tại giữ nguyên để lấy tổng số toàn bộ để pagination đúng
        const totalResult = await pool.request().query('SELECT COUNT(*) AS total FROM imports');
        const total = totalResult.recordset[0].total;

        // Xây dựng truy vấn SQL có lọc ngày tháng
        let query = `
            SELECT
                i.code,
                i.supplierName,
                i.status,
                i.time,
                i.totalAmount,
                i.paidAmount,
                id.code as detail_code,
                id.product_code,
                id.name as item_name,
                id.quantity,
                id.price
            FROM imports i
            LEFT JOIN import_details id ON i.code = id.import_code
        `;

        // Thêm điều kiện lọc ngày tháng nếu có
        const request = pool.request();
        if (startDate && endDate) {
            // Chuyển đổi chuỗi ngày sang đối tượng Date để truyền vào SQL
            const start = new Date(startDate);
            const end = new Date(endDate);
            query += ` WHERE i.time BETWEEN @startDate AND @endDate`;
            request.input('startDate', sql.Date, start);
            request.input('endDate', sql.Date, end);
        }

        query += ` ORDER BY i.code DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

        console.log('Backend SQL query:', query); // Log the SQL query

        // Lấy danh sách phiếu nhập kèm chi tiết sản phẩm
        const result = await request.query(query);

        console.log('Backend query result count:', result.recordset.length); // Log result count

        // Group items by import
        const imports = {};
        result.recordset.forEach(row => {
            if (!imports[row.code]) {
                imports[row.code] = {
                    code: row.code,
                    supplierName: row.supplierName,
                    status: row.status,
                    time: row.time,
                    totalAmount: row.totalAmount,
                    paidAmount: row.paidAmount,
                    items: []
                };
            }
            // Add item if it exists (import details are present)
            if (row.detail_code) {
                imports[row.code].items.push({
                    code: row.detail_code,
                    product_code: row.product_code,
                    name: row.item_name,
                    quantity: row.quantity,
                    price: row.price
                });
            }
        });

        res.json({
            data: Object.values(imports),
            pagination: { total, page, limit } // Keep pagination info if needed elsewhere
        });
    } catch (err) {
        console.error('Failed to fetch imports with details:', err.message);
        res.status(500).json({ error: 'Failed to fetch imports with details', details: err.message });
    }
});

// API: Lấy danh sách sản phẩm trong phiếu nhập (Endpoint này không còn cần thiết cho báo cáo)
// Tuy nhiên, giữ lại nếu có nơi khác sử dụng
router.get('/imports/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.request()
            .input('code', sql.VarChar, code)
            .query(`
                SELECT * FROM import_details
                WHERE import_code = @code
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch import details', details: err.message });
    }
});

// POST /api/imports
router.post('/imports', async (req, res) => {
    try {
        const { code, supplierName, status, time, items, totalAmount, paidAmount } = req.body;

        // Determine paidAmount based on status
        let calculatedPaidAmount = 0;
        if (status === 'Đã nhập') {
            calculatedPaidAmount = totalAmount;
        }

        // Lưu phiếu nhập
        await pool.request()
            .input('code', sql.VarChar, code)
            .input('supplierName', sql.NVarChar, supplierName)
            .input('status', sql.NVarChar, status)
            .input('time', sql.Date, time)
            .input('totalAmount', sql.Int, totalAmount)
            .input('paidAmount', sql.Int, calculatedPaidAmount)
            .query(`
                INSERT INTO imports (code, supplierName, status, time, totalAmount, paidAmount)
                VALUES (@code, @supplierName, @status, @time, @totalAmount, @paidAmount)
            `);

        // Lấy mã code cuối cùng của import_details
        const result = await pool.request().query('SELECT TOP 1 code FROM import_details ORDER BY code DESC');
        let lastCode = result.recordset.length > 0 ? result.recordset[0].code : 'CTPN000';
        let lastNum = parseInt(lastCode.replace('CTPN', '')) || 0;

        // Lưu chi tiết phiếu nhập
        for (const item of items) {
            lastNum++;
            const detailCode = 'CTPN' + String(lastNum).padStart(3, '0');
            await pool.request()
                .input('code', sql.VarChar, detailCode)
                .input('import_code', sql.VarChar, code)
                .input('product_code', sql.VarChar, item.code)
                .input('name', sql.NVarChar, item.name)
                .input('quantity', sql.Int, item.quantity)
                .input('price', sql.Int, item.price)
                .query(`
                    INSERT INTO import_details (code, import_code, product_code, name, quantity, price)
                    VALUES (@code, @import_code, @product_code, @name, @quantity, @price)
                `);
        }

        // Nếu trạng thái là "Đã nhập" thì cộng tồn kho
        if (status === 'Đã nhập') {
            for (const item of items) {
                await pool.request()
                    .input('code', sql.VarChar, item.code)
                    .input('qty', sql.Int, item.quantity)
                    .query('UPDATE products SET stock = stock + @qty WHERE code = @code');
            }
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save import', details: err.message });
    }
});

// PUT /api/imports/:code
router.put('/imports/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const { supplierName, status, time, items, totalAmount, paidAmount } = req.body;

        // Determine paidAmount based on new status
        let calculatedPaidAmount = 0;
         if (status === 'Đã nhập') {
            calculatedPaidAmount = totalAmount;
        }

        // Lấy trạng thái cũ
        const oldImport = await pool.request()
            .input('code', sql.VarChar, code)
            .query('SELECT status FROM imports WHERE code = @code');
        const oldStatus = oldImport.recordset[0]?.status;

        // Cập nhật phiếu nhập
        await pool.request()
            .input('code', sql.VarChar, code)
            .input('supplierName', sql.NVarChar, supplierName)
            .input('status', sql.NVarChar, status)
            .input('time', sql.Date, time)
            .input('totalAmount', sql.Int, totalAmount)
            .input('paidAmount', sql.Int, calculatedPaidAmount)
            .query(`
                UPDATE imports SET supplierName=@supplierName, status=@status, time=@time, totalAmount=@totalAmount, paidAmount=@paidAmount
                WHERE code=@code
            `);

        // Xóa chi tiết cũ
        await pool.request()
            .input('import_code', sql.VarChar, code)
            .query('DELETE FROM import_details WHERE import_code=@import_code');

        // Lấy mã code cuối cùng của import_details
        const result = await pool.request().query('SELECT TOP 1 code FROM import_details ORDER BY code DESC');
        let lastCode = result.recordset.length > 0 ? result.recordset[0].code : 'CT000';
        let lastNum = parseInt(lastCode.replace('CTPN', '')) || 0;

        // Thêm lại chi tiết mới
        for (const item of items) {
            lastNum++;
            const detailCode = 'CTPN' + String(lastNum).padStart(3, '0');
            await pool.request()
                .input('code', sql.VarChar, detailCode)
                .input('import_code', sql.VarChar, code)
                .input('product_code', sql.VarChar, item.code)
                .input('name', sql.NVarChar, item.name)
                .input('quantity', sql.Int, item.quantity)
                .input('price', sql.Int, item.price)
                .query(`
                    INSERT INTO import_details (code, import_code, product_code, name, quantity, price)
                    VALUES (@code, @import_code, @product_code, @name, @quantity, @price)
                `);
        }

        // Nếu chuyển từ "Phiếu tạm" sang "Đã nhập" hoặc đang là "Đã nhập" thì cộng tồn kho
        if ((oldStatus === 'Phiếu tạm' && status === 'Đã nhập') || (oldStatus !== 'Đã nhập' && status === 'Đã nhập')) {
            for (const item of items) {
                await pool.request()
                    .input('code', sql.VarChar, item.code)
                    .input('qty', sql.Int, item.quantity)
                    .query('UPDATE products SET stock = stock + @qty WHERE code = @code');
            }
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update import', details: err.message });
    }
});

// GET /api/import_details?import_code=PN001
router.get('/import_details', async (req, res) => {
    try {
        const code = req.query.import_code;
        const result = await pool.request()
            .input('import_code', sql.VarChar, code)
            .query('SELECT * FROM import_details WHERE import_code=@import_code');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch import details', details: err.message });
    }
});

// GET /api/import_details?import_code=PN001
router.get('/import_details', async (req, res) => {
    try {
        const code = req.query.import_code;
        const result = await pool.request()
            .input('import_code', sql.VarChar, code)
            .query('SELECT * FROM import_details WHERE import_code=@import_code');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch import details', details: err.message });
    }
});

// GET /api/products/active
router.get('/products/active', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM products WHERE active=1');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});

// GET /api/suppliers
router.get('/suppliers', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM suppliers ORDER BY name');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch suppliers', details: err.message });
    }
});


// API endpoints for packages
router.get('/packages', async (req, res) => {
    try {
        console.log('Fetching packages...');
        const result = await pool.request().query(`
            SELECT * FROM packages
            ORDER BY name
        `);
        console.log('Found packages:', result.recordset.length);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching packages:', err);
        res.status(500).json({
            error: 'Failed to fetch packages',
            details: err.message
        });
    }
});

// API endpoints for suppliers
router.get('/suppliers', async (req, res) => {
    try {
        console.log('Fetching suppliers...');
        const result = await pool.request().query(`
            SELECT * FROM suppliers
            ORDER BY name
        `);
        console.log('Found suppliers:', result.recordset.length);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching suppliers:', err);
        res.status(500).json({
            error: 'Failed to fetch suppliers',
            details: err.message
        });
    }
});

app.get('/api/pt-summary', async (req, res) => {
  try {
    const result = await pool.request().query(`
      -- Viết câu SQL tổng hợp PT ở đây
      SELECT e.name as hlv, MIN(s.scheduleDate) as [from], MAX(s.scheduleDate) as [to],
             COUNT(*) as total,
             SUM(CASE WHEN s.status = N'Đã huỷ' THEN 1 ELSE 0 END) as canceled
      FROM schedules s
      JOIN employees e ON s.employee_code = e.code
      WHERE e.position = N'Huấn luyện viên'
      GROUP BY e.name
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pt-sessions-summary', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT e.name as hlv, MIN(s.scheduleDate) as [from], MAX(s.scheduleDate) as [to],
             COUNT(*) as total,
             SUM(CASE WHEN s.status = N'Đã xác nhận' THEN 1 ELSE 0 END) as confirmed,
             SUM(CASE WHEN s.status != N'Đã xác nhận' THEN 1 ELSE 0 END) as unconfirmed
      FROM schedules s
      JOIN employees e ON s.employee_code = e.code
      WHERE e.position = N'Huấn luyện viên'
      GROUP BY e.name
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pt-salary-summary', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT e.name as hlv, MIN(s.scheduleDate) as [from], MAX(s.scheduleDate) as [to],
             COUNT(*) as sessions,
             SUM(s.endHour - s.startHour) as hours,
             SUM(ISNULL(salary,0)) as salary
      FROM schedules s
      JOIN employees e ON s.employee_code = e.code
      WHERE e.position = N'Huấn luyện viên'
      GROUP BY e.name
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pt-class-sessions', async (req, res) => {
  try {
    // Lấy danh sách HLV và ca làm việc
    const trainersResult = await pool.request().query(`
      SELECT e.code as hlv_code, e.name as hlv
      FROM employees e
      WHERE e.position = N'Huấn luyện viên'
    `);

    // Lấy tất cả ca làm việc (shifts) của HLV
    const shiftsResult = await pool.request().query(`
      SELECT s.employee_code, s.scheduleName, 
             FORMAT(s.startDate, 'yyyy-MM-dd') as startDate, 
             FORMAT(s.endDate, 'yyyy-MM-dd') as endDate, 
             s.cycle
      FROM shifts s
    `);

    // Lấy tất cả lịch tập (schedules) của HLV
    const schedulesResult = await pool.request().query(`
      SELECT s.employee_code, s.scheduleDate, s.startHour, s.endHour
      FROM schedules s
    `);

    // Gom dữ liệu
    const trainers = trainersResult.recordset;
    const shifts = shiftsResult.recordset;
    const schedules = schedulesResult.recordset;

    // Tính tổng số buổi dạy cho từng HLV
    const data = trainers.map(trainer => {
      // Lấy các ca làm việc của HLV này
      const trainerShifts = shifts.filter(s => s.employee_code === trainer.hlv_code);
      // Lấy các lịch tập của HLV này
      const trainerSchedules = schedules.filter(s => s.employee_code === trainer.hlv_code);

      // Ghép lịch trình thành chuỗi
      const scheduleArr = trainerSchedules.map(sch => ({
        date: sch.scheduleDate,
        startHour: sch.startHour,
        endHour: sch.endHour
      }));

      return {
        hlv: trainer.hlv,
        hlv_code: trainer.hlv_code,
        schedules: scheduleArr,
        total_sessions: trainerSchedules.length
      };
    });

    res.json(data);
  } catch (err) {
    console.error('Lỗi API /api/pt-class-sessions:', err);
    res.status(500).json({ error: err.message });
  }
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api`);
});

async function deleteTrainer(code) {
  try {
    console.log("Gửi request xóa HLV với code:", code);
    const response = await fetch(`http://localhost:5000/api/employees/${code}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error('Lỗi khi xóa HLV');
    }
    alert('Xóa HLV thành công!');
    location.reload();
  } catch (error) {
    console.error("Lỗi khi xóa HLV:", error);
    alert('Không thể xóa HLV. Vui lòng thử lại sau!');
  }
}

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
        alert('Không thể xóa ca tập. Vui lòng thử lại sau!');
      });
  }
}

// API: Lấy dữ liệu đăng ký hội viên
app.get('/api/customer-registrations', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const result = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          c.code as customer_code,
          c.name as customer_name,
          c.phone,
          cp.code as registration_code,
          cp.start_date,
          cp.end_date,
          cp.status as package_status,
          p.code as package_code,
          p.name as package_name,
          p.price as package_price
        FROM customers c
        JOIN customer_packages cp ON c.code = cp.customer_code
        JOIN packages p ON cp.package_code = p.code
        WHERE cp.start_date BETWEEN @startDate AND @endDate
        ORDER BY cp.start_date DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching customer registrations:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Lấy thống kê theo gói
app.get('/api/package-statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const result = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          p.code as package_code,
          p.name as package_name,
          COUNT(cp.code) as registration_count,
          SUM(p.price) as total_revenue
        FROM packages p
        LEFT JOIN customer_packages cp ON p.code = cp.package_code
        WHERE cp.start_date BETWEEN @startDate AND @endDate
        GROUP BY p.code, p.name
        ORDER BY registration_count DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching package statistics:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Lấy thống kê theo nhân viên
app.get('/api/employee-statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const result = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          e.code as employee_code,
          e.name as employee_name,
          COUNT(cp.code) as registration_count,
          SUM(p.price) as total_revenue
        FROM employees e
        LEFT JOIN customer_packages cp ON e.code = cp.employee_code
        LEFT JOIN packages p ON cp.package_code = p.code
        WHERE cp.start_date BETWEEN @startDate AND @endDate
        GROUP BY e.code, e.name
        ORDER BY registration_count DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching employee statistics:', err);
    res.status(500).json({ error: err.message });
  }
});

