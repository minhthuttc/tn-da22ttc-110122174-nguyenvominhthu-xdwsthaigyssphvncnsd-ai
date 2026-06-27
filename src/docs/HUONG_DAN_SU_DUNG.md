# HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG HỆ THỐNG

## 1. YÊU CẦU HỆ THỐNG

### Phần mềm cần thiết:
- **Node.js** 18.x trở lên
- **MySQL** 8.0 trở lên
- **Git**
- **Trình duyệt web** (Chrome, Firefox, Edge)

### Tài khoản API:
- Google Gemini API Key
- PayOS Credentials (Client ID, API Key, Checksum Key)

---

## 2. CÀI ĐẶT

### Bước 1: Clone hoặc giải nén source code
```bash
# Giải nén file đã download
# hoặc clone từ GitHub:
git clone https://github.com/minhthuttc/KHOA_LUAN.git
cd KHOA_LUAN
```

### Bước 2: Cài đặt Database
```bash
# Tạo database bằng cách import file init-db.sql
# Mở MySQL Workbench hoặc command line:
mysql -u root -p < init-db.sql
```

Hoặc thủ công:
1. Mở MySQL Workbench
2. Tạo connection với thông tin: host=127.0.0.1, user=root
3. Import file `init-db.sql`
4. Database `ai_sim_db` sẽ được tạo tự động

### Bước 3: Cấu hình Backend
```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục backend với nội dung:
```env
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_sim_db

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# PayOS Payment Gateway
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Server Port
PORT=5000
```

**Lấy API Keys:**
- **Gemini API**: https://ai.google.dev/
- **PayOS**: https://payos.vn/

### Bước 4: Cấu hình Frontend
```bash
cd ../frontend
npm install
```

---

## 3. CHẠY ỨNG DỤNG

### Khởi động Backend (Terminal 1):
```bash
cd backend
node index.js
```
✅ Server chạy tại: `http://localhost:5000`

### Khởi động Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```
✅ Website chạy tại: `http://localhost:3000`

---

## 4. TÀI KHOẢN DEMO

### Admin:
- **Tên đăng nhập:** Admin
- **Mật khẩu:** admin123

### Khách hàng:
- Đăng ký tài khoản mới tại: `http://localhost:3000/register`

---

## 5. HƯỚNG DẪN SỬ DỤNG

### 5.1. Dành cho Khách hàng

#### Đăng ký/Đăng nhập:
1. Truy cập trang chủ `http://localhost:3000`
2. Click **"Đăng ký"** → Điền thông tin đầy đủ
3. Đăng nhập với tài khoản vừa tạo

#### Tìm kiếm sim:
1. Click menu **"Kho số"**
2. Sử dụng bộ lọc:
   - Nhà mạng (Viettel, Vinaphone, Mobifone)
   - Khoảng giá
   - Mệnh phong thủy
3. Click vào sim để xem chi tiết
4. Click **"Mua ngay"** để đặt mua

#### Phân tích phong thủy AI:
1. Click menu **"Xem Phong Thủy"**
2. Nhập thông tin cá nhân:
   - Ngày sinh (dd/mm/yyyy)
   - Giờ sinh (tùy chọn)
   - Chọn mệnh (Kim, Mộc, Thủy, Hỏa, Thổ)
   - Giới tính (Nam/Nữ)
3. Nhập yêu cầu:
   - Số yêu thích (các con số bạn thích)
   - Ngân sách tối đa
   - Nhà mạng mong muốn
   - Mục đích sử dụng
4. Click **"Phân tích AI"**
5. Hệ thống sẽ gợi ý top 10 sim phù hợp nhất

#### Mua sim:
1. Click **"Mua ngay"** trên sim card
2. Nhập thông tin nhận hàng:
   - Họ tên
   - Số điện thoại
   - Địa chỉ nhận sim
3. Chọn phương thức thanh toán:
   - **PayOS**: Chuyển khoản ngân hàng qua QR code
   - **COD**: Thanh toán khi nhận hàng
4. Click **"Xác nhận mua"**
5. Nếu chọn PayOS: Quét mã QR để thanh toán
6. Chờ admin duyệt đơn hàng

#### Xem lịch sử:
1. Click icon **Tài khoản** trên header
2. Xem các tab:
   - **Lịch sử mua sim**: Theo dõi đơn hàng
   - **Lịch sử phong thủy**: Xem các lần phân tích
   - **Lịch sử gợi ý**: Xem các sim đã được AI gợi ý

### 5.2. Dành cho Admin

#### Đăng nhập Admin:
1. Đăng nhập bằng tài khoản Admin (admin123)
2. Click nút **"Admin"** màu tím trên header

#### Quản lý Sim:
1. Tab **"Quản lý Sim"**
2. Click **"+ Thêm Sim"** để thêm sim mới:
   - Số sim (10 chữ số)
   - Nhà mạng
   - Giá bán
   - Phân loại
   - Mệnh phong thủy
3. Click **"Xóa"** để xóa sim khỏi kho

#### Quản lý User:
1. Tab **"Quản lý User"**
2. Xem danh sách tất cả user đã đăng ký
3. Click **"Xem lịch sử"** để xem chi tiết hoạt động của user

#### Duyệt đơn hàng:
1. Tab **"Lịch sử mua sim"**
2. Xem thông tin đơn hàng:
   - Khách hàng
   - Sim đã đặt
   - Giá
   - Trạng thái thanh toán
   - Địa chỉ giao hàng
3. Click **"Duyệt"** để xác nhận đơn (sim sẽ chuyển sang "Đã bán")
4. Click **"Từ chối"** để hủy đơn

#### Xem thống kê:
1. Xem 3 biểu đồ:
   - **Sim theo nhà mạng**: Phân bố sim trong kho
   - **Sim theo mệnh**: Phân bố theo phong thủy
   - **Top sim xem nhiều**: 20 sim được quan tâm nhất
2. Tab **"Lịch sử phong thủy"**: Xem ai đã sử dụng tính năng AI
3. Tab **"Lịch sử phân tích"**: Xem các yêu cầu gợi ý sim

#### Quản lý tin nhắn:
1. Tab **"Tin nhắn liên hệ"**
2. Đọc tin nhắn từ khách hàng gửi qua form liên hệ
3. Click **"Đánh dấu đã đọc"** hoặc **"Đánh dấu chưa đọc"**

---

## 6. TÍNH NĂNG CHÍNH

### Cho Khách hàng:
- ✅ Tìm kiếm và lọc sim số đẹp theo nhiều tiêu chí
- ✅ Phân tích sim phù hợp theo phong thủy với AI Gemini
- ✅ Gợi ý sim dựa trên ngày sinh, mệnh, sở thích cá nhân
- ✅ Thanh toán online qua PayOS hoặc COD
- ✅ Xem chi tiết sim với AI giải thích tại sao phù hợp
- ✅ Theo dõi lịch sử mua hàng và phân tích
- ✅ Responsive design - Tương thích mobile/tablet/desktop

### Cho Admin:
- ✅ Quản lý kho sim (Thêm/Xóa)
- ✅ Quản lý người dùng
- ✅ Duyệt đơn hàng
- ✅ Xem thống kê và báo cáo
- ✅ Quản lý tin nhắn liên hệ
- ✅ Dashboard trực quan với biểu đồ

---

## 7. XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: "Cannot connect to database"
**Nguyên nhân:** MySQL chưa khởi động hoặc thông tin kết nối sai

**Giải pháp:**
```bash
# Kiểm tra MySQL đang chạy
# Windows: Mở Services → tìm MySQL → Start
# hoặc qua Laragon/XAMPP

# Kiểm tra file .env có đúng không:
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=<your_password>
DB_NAME=ai_sim_db
```

### ❌ Lỗi: "Port 5000 already in use"
**Nguyên nhân:** Cổng 5000 đã được sử dụng

**Giải pháp:**
```bash
# Đổi PORT trong file backend/.env
PORT=5001

# Hoặc tắt process đang dùng port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### ❌ Lỗi: "Port 3000 already in use"
**Nguyên nhân:** Next.js đang chạy instance khác

**Giải pháp:**
```bash
# Đổi port khi chạy:
npm run dev -- -p 3001

# Hoặc tắt process:
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### ❌ Lỗi: "Invalid API key - Gemini"
**Nguyên nhân:** API key Gemini không hợp lệ

**Giải pháp:**
1. Truy cập https://ai.google.dev/
2. Tạo API key mới
3. Cập nhật vào file `.env`:
   ```
   GEMINI_API_KEY=<your_new_key>
   ```
4. Restart backend server

### ❌ Lỗi: "PayOS payment failed"
**Nguyên nhân:** PayOS credentials sai hoặc hết hạn

**Giải pháp:**
1. Kiểm tra PayOS dashboard: https://payos.vn/
2. Lấy lại credentials
3. Cập nhật file `.env`
4. Restart backend

### ❌ Lỗi: Module not found
**Nguyên nhân:** Chưa cài đặt dependencies

**Giải pháp:**
```bash
# Xóa và cài lại:
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 8. CẤU TRÚC DỰ ÁN

```
KHOA_LUAN/
├── backend/                 # Backend API
│   ├── services/           # PayOS, AI services
│   ├── index.js           # Main server
│   ├── seed.js            # Generate sample data
│   └── package.json
│
├── frontend/               # Frontend Next.js
│   ├── src/
│   │   ├── app/           # Pages (Next.js App Router)
│   │   └── components/    # React components
│   ├── public/            # Static assets
│   └── package.json
│
├── init-db.sql            # Database schema
└── README.md              # Hướng dẫn chính
```

---

## 9. CÔNG NGHỆ SỬ DỤNG

### Frontend:
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Charts:** Recharts

### Backend:
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **ORM/Query:** mysql2
- **AI:** Google Gemini API
- **Payment:** PayOS API

---

## 10. LIÊN HỆ HỖ TRỢ

- **Email:** nguyenthutv.220403@gmail.com
- **Điện thoại:** 0382 286 177
- **GitHub:** https://github.com/minhthuttc/KHOA_LUAN

---

## 11. VIDEO DEMO

Xem video hướng dẫn chi tiết tại: [Link YouTube sẽ được cập nhật]

---

**© 2024 - Hệ thống Gợi ý Sim Số Đẹp với AI**
**Sinh viên thực hiện: Nguyễn Võ Minh Thư**
