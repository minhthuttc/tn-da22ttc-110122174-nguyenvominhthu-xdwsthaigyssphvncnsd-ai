# 🎯 Website Thương Mại Điện Tử SIM Số Phong Thủy

## 📋 Thông tin đề tài

- **Tên đề tài:** Xây dựng website thương mại điện tử AI gợi ý sim số phù hợp với phong thủy và vận mệnh cá nhân
- **Sinh viên thực hiện:** Nguyễn Võ Minh Thư
- **MSSV:** 110122174
- **Lớp:** DA22TTC
- **Trường:** Đại học Trà Vinh
- **Năm:** 2026

## 🌟 Giới thiệu

Hệ thống website thương mại điện tử bán SIM số có tích hợp trí tuệ nhân tạo (Google Gemini AI) để phân tích phong thủy và gợi ý SIM phù hợp với vận mệnh cá nhân dựa trên ngày giờ sinh, giới tính và sở thích của người dùng.

## 🚀 Công nghệ sử dụng

### Frontend
- **Framework:** Next.js 16.2+ (App Router)
- **UI Library:** React 19.2
- **Styling:** TailwindCSS 4.2
- **HTTP Client:** Axios 1.16
- **Icons:** Lucide React 1.7
- **Charts:** Recharts 3.8
- **QR Code:** qrcode 1.5

### Backend
- **Framework:** Express.js 5.2
- **Database:** MySQL2 3.20
- **AI Engine:** Google Gemini AI (@google/generative-ai 0.24)
- **Payment:** PayOS Node SDK 2.0
- **Environment:** dotenv 17.4
- **CORS:** cors 2.8

### Database
- MySQL 8.0+ hoặc MariaDB 10.5+
- Character Set: UTF8MB4
- Database Name: `ai_sim_db`

## 📁 Cấu trúc thư mục

```
src/
├── backend/              # Backend API Server
│   ├── services/        
│   │   ├── paymentHandler.js    # Xử lý thanh toán
│   │   └── payosService.js      # Tích hợp PayOS
│   ├── index.js                  # Main server
│   ├── package.json
│   └── .env                      # Cấu hình môi trường
│
├── frontend/            # Frontend Next.js App
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── page.js          # Trang chủ
│   │   │   ├── login/           # Đăng nhập
│   │   │   ├── register/        # Đăng ký
│   │   │   ├── sim-store/       # Kho sim
│   │   │   ├── feng-shui/       # Xem phong thủy
│   │   │   ├── recommendation/  # Gợi ý sim
│   │   │   ├── payment/         # Thanh toán
│   │   │   ├── contact/         # Liên hệ
│   │   │   ├── user/            # Thông tin user
│   │   │   └── admin/           # Quản trị
│   │   └── components/          # React components
│   ├── public/                   # Static files
│   └── package.json
│
├── docs/                # Tài liệu
│   ├── HUONG_DAN_SU_DUNG.md     # Hướng dẫn sử dụng
│   └── README_DOCS.md            # Mô tả tài liệu
│
└── init-db.sql          # Script khởi tạo database
```

## ⚙️ Cài đặt và chạy

### 1️⃣ Yêu cầu hệ thống

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **MySQL:** >= 8.0 hoặc MariaDB >= 10.5
- **RAM:** >= 4GB
- **Disk:** >= 1GB trống

### 2️⃣ Cài đặt Database

```bash
# 1. Đăng nhập MySQL
mysql -u root -p

# 2. Chạy script khởi tạo
source src/init-db.sql

# Hoặc trên Windows:
mysql -u root -p < src/init-db.sql
```

Script sẽ tạo:
- Database `ai_sim_db`
- 7 bảng: `the_sim`, `nguoi_dung`, `don_hang`, `lich_su_phong_thuy`, `lich_su_phan_tich`, `tin_nhan`
- Dữ liệu mẫu: 3 users, 15 sim

### 3️⃣ Cấu hình Backend

```bash
cd src/backend
npm install
```

**Cấu hình file `.env`:**

```env
# PayOS Payment Gateway
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# MySQL Database
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_sim_db
```

**Chạy backend:**

```bash
node index.js
```

✅ Server chạy tại: `http://localhost:5000`

### 4️⃣ Cấu hình Frontend

```bash
cd src/frontend
npm install
```

**Chạy development:**

```bash
npm run dev
```

✅ Website chạy tại: `http://localhost:3000`

**Build production:**

```bash
npm run build
npm start
```

## 🎨 Tính năng chính

### 🔐 Người dùng
- ✅ Đăng ký / Đăng nhập
- ✅ Xem thông tin cá nhân
- ✅ Lịch sử mua hàng
- ✅ Lịch sử xem phong thủy

### 🔮 Phong thủy AI
- ✅ Phân tích mệnh ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ)
- ✅ Tính Can Chi năm sinh
- ✅ Phân tích giờ sinh (12 Địa Chi)
- ✅ Gợi ý số may mắn, màu sắc, hướng, nghề nghiệp
- ✅ Phân tích tình duyên, tài lộc

### 🎯 Gợi ý SIM thông minh
- ✅ Thuật toán đa tiêu chí:
  - **P (Phong thủy):** Điểm nút sim, loại sim thần tài/lộc phát
  - **I (Sở thích):** Chứa năm sinh, số may mắn
  - **B (Hành vi):** Số lượt tìm kiếm
- ✅ Công thức: **S = 0.5P + 0.4I + 0.1B**
- ✅ Giải thích AI (Explainable AI)

### 🛒 Thương mại điện tử
- ✅ Xem kho sim (tìm kiếm, lọc, sắp xếp)
- ✅ Đặt mua sim
- ✅ Thanh toán:
  - Chuyển khoản ngân hàng (webhook auto-approve)
  - Cổng PayOS (QR, ATM, Visa/Mastercard)
- ✅ Theo dõi đơn hàng real-time

### 👨‍💼 Quản trị viên
- ✅ Quản lý user (khóa/mở khóa tài khoản)
- ✅ Quản lý kho sim (thêm/xóa/sửa)
- ✅ Duyệt đơn hàng
- ✅ Xem thống kê:
  - Sim được tìm kiếm nhiều nhất
  - Doanh thu theo thời gian
  - Lịch sử xem phong thủy
  - Tin nhắn liên hệ

## 🔌 API Endpoints

### Authentication
```
POST /api/register          # Đăng ký
POST /api/login             # Đăng nhập
GET  /api/users/all         # Danh sách user (gợi ý login)
GET  /api/users/search      # Tìm user
```

### SIM Management
```
GET  /api/sims              # Lấy danh sách sim
GET  /api/sims/popular      # Sim nổi bật
PUT  /api/sims/:id/increment-search  # Tăng lượt tìm kiếm
```

### Feng Shui AI
```
POST /api/fengshui-ai-analysis    # Phân tích phong thủy bằng AI
POST /api/fengshui-history        # Lưu lịch sử
GET  /api/admin/fengshui-history  # Xem lịch sử (admin)
```

### Recommendation
```
POST /api/recommend                    # Gợi ý sim theo AI
POST /api/recommendation-history       # Lưu lịch sử gợi ý
GET  /api/admin/recommendation-history # Xem lịch sử (admin)
```

### Purchase & Payment
```
POST /api/purchase                     # Tạo đơn hàng
GET  /api/admin/purchases              # Danh sách đơn hàng
PUT  /api/admin/purchases/:id/status   # Cập nhật trạng thái
POST /api/payment/create               # Tạo link thanh toán PayOS
POST /api/payos/webhook                # Webhook PayOS
POST /api/webhook/bank-transfer        # Webhook chuyển khoản
GET  /api/order/payment-status/:id     # Kiểm tra trạng thái thanh toán
```

### Contact
```
POST /api/contact            # Gửi tin nhắn liên hệ
GET  /api/admin/messages     # Xem tin nhắn (admin)
PUT  /api/admin/messages/:id # Đánh dấu đã đọc
```

## 📊 Database Schema

### 7 bảng chính:

1. **the_sim** - Thông tin thẻ SIM
2. **nguoi_dung** - Người dùng (customer/admin)
3. **don_hang** - Đơn hàng
4. **lich_su_phong_thuy** - Lịch sử xem phong thủy
5. **lich_su_phan_tich** - Lịch sử phân tích nhu cầu
6. **tin_nhan** - Tin nhắn liên hệ

Chi tiết schema xem trong `src/init-db.sql`

## 🧪 Test

### Test Backend API
```bash
cd src/backend

# Test health check
curl http://localhost:5000/api/sims

# Test webhook (cần đơn hàng có sẵn)
curl -X POST http://localhost:5000/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"simNumber":"0981234567","amount":1500000}'
```

### Tài khoản test mặc định
```
Admin:
- Username: admin
- Password: admin123

User:
- Username: user1
- Password: user123
```

## 📝 Tài liệu

- [Hướng dẫn sử dụng chi tiết](docs/HUONG_DAN_SU_DUNG.md)
- [Báo cáo khóa luận](../docs/110122174__BAOCAOKLTN_2026.pdf)

## 🐛 Troubleshooting

### Backend không kết nối được database
```bash
# Kiểm tra MySQL đã chạy
mysql -u root -p

# Kiểm tra file .env đúng thông tin
cat src/backend/.env
```

### Frontend không gọi được API
```bash
# Kiểm tra backend đã chạy
curl http://localhost:5000/api/sims

# Kiểm tra CORS
# Backend đã bật cors(), không cần cấu hình thêm
```

### Gemini AI trả về lỗi
- Kiểm tra `GEMINI_API_KEY` trong `.env`
- API key lấy tại: https://makersuite.google.com/app/apikey
- Free tier có giới hạn 60 requests/phút

### PayOS webhook không hoạt động
- Webhook cần domain public (dùng ngrok để test local)
- Kiểm tra `PAYOS_CHECKSUM_KEY` đúng

## 📄 License

Đề tài khóa luận tốt nghiệp - For Educational Purpose Only

## 👤 Liên hệ

- **Sinh viên:** Nguyễn Võ Minh Thư
- **Email:** 110122174@sv.tvu.edu.vn
- **Trường:** Đại học Trà Vinh

---

⭐ **Lưu ý:** Đây là project khóa luận tốt nghiệp, không dùng cho mục đích thương mại.
