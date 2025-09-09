# Bảng chụp CSDL đã cài đặt:
<img width="1746" height="828" alt="image" src="https://github.com/user-attachments/assets/0c8f6b9a-1f77-4a9a-b3b8-dc7667214310" />


---
# Mô tả các bảng dữ liệu:

### KHACHANG : Lưu thông tin khách hàng
| Tên trường   | Kiểu dữ liệu     | Mô tả             |
|--------------|------------------|-------------------|
| MaKH         | INT, PK          | Mã khách hàng     |
| HoTen        | NVARCHAR(255)    | Họ tên khách hàng |
| NgaySinh     | DATE             | Ngày sinh         |
| SDT          | NVARCHAR(20)     | Số điện thoại     |
| DiaChi       | NVARCHAR(255)    | Địa chỉ           |
| MaGoi        | INT, FK          | Mã gói tập        |

### GOITAP : Lưu thông tin gói tập
| Tên trường | Kiểu dữ liệu     | Mô tả     |
|------------|------------------|-----------|
| MaGoi     | INT, PK          | Mã gói tập    |
| TenGoi     | NVARCHAR(255)    | Tên gói tập   |
| MoTa     | TEXT    | Mô tả   |
| Gia     | FLOAT    | Giá tiền   |
| TC       | INT          | Thời gian gói|

### LICHTAP : Lưu thông tin lịch tập
| Tên trường | Kiểu dữ liệu     | Mô tả     |
|------------|------------------|-----------|
| MaLich      | INT, PK          | Mã lịch tập    |
| TGBatDau     | DATATIME    | Ngày giờ bắt đầu   |
| TGKetThuc     | DATATIME    | Ngày giờ kết thúc   |
| NoiDung     | TEXT    | Nội dung buổi tập   |
| MaKH       | INT, FK          | Mã khách hàng|
| MaNV       | INT, FK          | Mã nhân viên|

### HOADON : Lưu thông tin hoá đơn
| Tên trường | Kiểu dữ liệu     | Mô tả     |
|------------|------------------|-----------|
| MaHD      | INT, PK          | Mã hoá đơn    |
| NgayLap     | DATE    | Ngày lập hoá đơn   |
| MaNV       | INT, FK          | Mã nhân viên|
| MaKH       | INT, FK          | Mã khách hàng|

### CHITIETHOADON_GOITAP : Lưu thông tin chi tiết hoá đơn thanh toán gói tập
| Tên trường | Kiểu dữ liệu     | Mô tả     |
|------------|------------------|-----------|
| MaHD      | INT, PK          | Mã hoá đơn    |
| MaGoi      | INT, PK          | Mã gói tập    |
| SL     | INT    | Số lượng   |
| TongTien       | FLOAT          | Thành tiền|

### SANPHAM : Lưu thông tin sản phẩm
| Tên trường | Kiểu dữ liệu     | Mô tả     |
|------------|------------------|-----------|
| MaSP      | INT, PK          | Mã sản phẩm    |
| TenSP     | NVARCHAR(255)    | Tên sản phẩm   |
| MoTa       | TEXT          | Mô tả sản phẩm|
| DonGia       | FLOAT          | Đơn giá|

### CHITIETHOADON_SANPHAM : Lưu thông tin chi tiết hoá đơn thanh toán các sản phẩm
| Tên trường | Kiểu dữ liệu     | Mô tả     |
|------------|------------------|-----------|
| MaHD      | INT, PK          | Mã hoá đơn    |
| MaSP      | INT, PK          | Mã sản phẩm    |
| SL     | INT    | Số lượng   |
| TongTien       | FLOAT          | Thành tiền|

### NHANVIEN : Lưu thông tin nhân viên
| Tên trường | Kiểu dữ liệu     | Mô tả     |
|------------|------------------|-----------|
| MaNV      | INT, PK          | Mã nhân viên  |
| HoTen     | NVARCHAR(255)    | Họ tên   |
| VaiTro     | NVARCHAR(100)    | Vai trò   |
| SDT     | VARCHAR(20)    | Số điện thoại   |
| MaQL       | INT, FK          | Mã quản lý|



### THIETBI : Lưu thông tin thiết bị  
| Tên trường | Kiểu dữ liệu     | Mô tả         |
|------------|------------------|---------------|
| MaTB       | INT, PK          | Mã thiết bị   |
| TenTB      | NVARCHAR(255)    | Tên thiết bị  |
| MoTa       | TEXT             | Mô tả         |
| NgayNhap   | DATE             | Ngày nhập     |
| TinhTrang  | NVARCHAR(100)    | Tình trạng    |
| MaKho      | INT, FK          | Mã kho        |



### NHACUNGCAP : Lưu thông tin nhà cung cấp  
| Tên trường | Kiểu dữ liệu     | Mô tả               |
|------------|------------------|---------------------|
| MaNCC      | INT, PK          | Mã nhà cung cấp     |
| TenNCC     | NVARCHAR(255)    | Tên nhà cung cấp    |
| DiaChi     | NVARCHAR(255)    | Địa chỉ             |
| SDT      | VARCHAR(20)          | Số điện thoại        |

### KHO : Lưu thông tin kho  
| Tên trường | Kiểu dữ liệu     | Mô tả      |
|------------|------------------|------------|
| MaKho      | INT, PK          | Mã kho     |
| TenKho     | NVARCHAR(255)    | Tên kho    |
| DiaChi     | NVARCHAR(255)    | Địa chỉ    |
| MaQL       | INT, FK          | Mã quản lí |


### PHIEUNHAP : Lưu thông tin phiếu nhập hàng  
| Tên trường | Kiểu dữ liệu     | Mô tả             |
|------------|------------------|------------------|
| MaPhieu    | INT, PK          | Mã phiếu nhập    |
| MaKho      | INT, FK          | Mã kho           |
| MaNCC      | INT, FK          | Mã nhà cung cấp  |
| NgayNhap   | DATE             | Ngày nhập        |
| GhiChu     | TEXT             | Ghi chú          |


### NGUOIQUANLY : Lưu thông tin người quản lý  
| Tên trường | Kiểu dữ liệu     | Mô tả          |
|------------|------------------|----------------|
| MaQL       | INT, PK          | Mã quản lý     |
| HoTen      | NVARCHAR(255)    | Họ tên         |
| DiaChi     | NVARCHAR(255)    | Địa chỉ        |
| SDT        | VARCHAR(20)      | Số điện thoại  |

