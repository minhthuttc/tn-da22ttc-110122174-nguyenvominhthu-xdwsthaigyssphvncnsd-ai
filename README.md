# 🎯 Đề tài Khóa luận: Website Thương Mại Điện Tử SIM Số Phong Thủy

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-green)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![Google Gemini AI](https://img.shields.io/badge/Gemini-AI-orange)](https://ai.google.dev/)

## 📋 Thông tin sinh viên

- **Họ tên:** Nguyễn Võ Minh Thư
- **MSSV:** 110122174
- **Lớp:** DA22TTC
- **Trường:** Đại học Trà Vinh
- **Năm học:** 2025-2026
- **Tên đề tài:** Xây dựng website thương mại điện tử AI gợi ý sim số phù hợp với phong thủy và vận mệnh cá nhân

## 🌟 Mô tả dự án

Hệ thống website thương mại điện tử chuyên bán SIM số có tích hợp trí tuệ nhân tạo (Google Gemini AI) để:

✨ **Phân tích phong thủy** dựa trên ngày giờ sinh, giới tính  
✨ **Gợi ý SIM phù hợp** với vận mệnh và sở thích cá nhân  
✨ **Giải thích AI** (Explainable AI) - Tại sao SIM này phù hợp với bạn  
✨ **Thanh toán online** qua PayOS và chuyển khoản ngân hàng  
✨ **Quản lý toàn diện** cho admin và khách hàng  

## 🚀 Demo

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** MySQL (ai_sim_db)

## 📸 Screenshots

[Sẽ thêm screenshots ở đây]

## 🛠️ Công nghệ

| Lớp | Công nghệ |
|------|-----------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4 |
| **Backend** | Express.js 5, Node.js |
| **Database** | MySQL 8, mysql2 |
| **AI** | Google Gemini AI |
| **Payment** | PayOS, Webhook |
| **Charts** | Recharts 3.8 |
| **Icons** | Lucide React |

## 📂 Cấu trúc project

```
📦 tn-da22ttc-110122174-nguyenvominhthu-xdwsthaigyssphvncnsd-ai
│
├── 📁 docs/                      # Tài liệu báo cáo
│   ├── 110122174__BAOCAOKLTN_2026.pdf
│   └── 110122174__BAOCAOKLTN_2026.docx
│
├── 📁 src/                       # Source code
│   ├── 📁 backend/              # Express.js API
│   │   ├── services/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── 📁 frontend/             # Next.js App
│   │   ├── src/app/
│   │   ├── src/components/
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── 📁 docs/                 # Tài liệu hướng dẫn
│   │   └── HUONG_DAN_SU_DUNG.md
│   │
│   ├── init-db.sql              # Database schema
│   └── README.md
│
└── README.md                    # File này
```

## 🎯 Tính năng chính

### 🔐 Người dùng
- [x] Đăng ký / Đăng nhập
- [x] Quản lý thông tin cá nhân
- [x] Lịch sử mua hàng
- [x] Lịch sử xem phong thủy

### 🔮 AI & Phong thủy
- [x] Phân tích mệnh ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ)
- [x] Tính Can Chi năm sinh
- [x] Phân tích 12 giờ Địa Chi
- [x] Gợi ý số may mắn, màu sắc, hướng
- [x] Phân tích tình duyên, tài lộc
- [x] Gợi ý nghề nghiệp phù hợp

### 🎯 Gợi ý thông minh
- [x] Thuật toán scoring đa tiêu chí (Phong thủy + Sở thích + Hành vi)
- [x] Explainable AI - Giải thích lý do gợi ý
- [x] Lọc theo ngân sách, nhà mạng
- [x] Top 10 SIM phù hợp nhất

### 🛒 Thương mại điện tử
- [x] Xem kho SIM (tìm kiếm, lọc, sắp xếp)
- [x] SIM nổi bật (được tìm nhiều nhất)
- [x] Đặt mua SIM
- [x] Thanh toán PayOS (QR, ATM, Visa)
- [x] Thanh toán chuyển khoản (auto webhook)
- [x] Tracking đơn hàng real-time

### 👨‍💼 Quản trị
- [x] Dashboard thống kê
- [x] Quản lý user (khóa/mở)
- [x] Quản lý kho SIM
- [x] Duyệt đơn hàng
- [x] Xem tin nhắn liên hệ
- [x] Thống kê doanh thu, lượt xem

## 🚀 Cài đặt nhanh

### 1. Clone repository

```bash
git clone https://github.com/minhthuttc/tn-da22ttc-110122174-nguyenvominhthu-xdwsthaigyssphvncnsd-ai.git
cd tn-da22ttc-110122174-nguyenvominhthu-xdwsthaigyssphvncnsd-ai
```

### 2. Cài đặt Database

```bash
mysql -u root -p < src/init-db.sql
```

### 3. Cài đặt Backend

```bash
cd src/backend
npm install

# Cấu hình .env
# - PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY
# - GEMINI_API_KEY
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

node index.js
```

### 4. Cài đặt Frontend

```bash
cd src/frontend
npm install
npm run dev
```

### 5. Truy cập

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📖 Tài liệu

- [📘 README chi tiết](src/README.md)
- [📗 Hướng dẫn sử dụng](src/docs/HUONG_DAN_SU_DUNG.md)
- [📕 Báo cáo khóa luận](docs/110122174__BAOCAOKLTN_2026.pdf)

## 🧪 Tài khoản test

```
Admin:
- Username: admin
- Password: admin123

User:
- Username: user1
- Password: user123
```

## 🔗 Links

- **GitHub:** https://github.com/minhthuttc/tn-da22ttc-110122174-nguyenvominhthu-xdwsthaigyssphvncnsd-ai
- **PayOS:** https://payos.vn
- **Google Gemini:** https://ai.google.dev

## 📝 License

Đề tài khóa luận tốt nghiệp - For Educational Purpose Only

---

**Sinh viên thực hiện:** Nguyễn Võ Minh Thư - 110122174  
**Trường:** Đại học Trà Vinh - Khoa Công nghệ Thông tin  
**Năm:** 2026
