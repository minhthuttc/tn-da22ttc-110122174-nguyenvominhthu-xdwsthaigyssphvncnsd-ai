-- ========================================
-- DATABASE SCHEMA FOR AI SIM SHOP
-- Website Thương mại điện tử SIM số phong thủy
-- ========================================

CREATE DATABASE IF NOT EXISTS ai_sim_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_sim_db;

-- Bảng thẻ SIM
CREATE TABLE IF NOT EXISTS the_sim (
    ma_sim INT AUTO_INCREMENT PRIMARY KEY,
    so_sim VARCHAR(15) NOT NULL UNIQUE,
    nha_mang VARCHAR(50) NOT NULL,
    gia_ban DECIMAL(15, 0) NOT NULL,
    loai_sim VARCHAR(100),
    menh_phong_thuy VARCHAR(20),
    diem_nut INT DEFAULT 0,
    trang_thai VARCHAR(20) DEFAULT 'Còn hàng',
    mo_ta TEXT,
    so_lan_tim_kiem INT DEFAULT 0,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS nguoi_dung (
    ma_nguoi_dung INT AUTO_INCREMENT PRIMARY KEY,
    ten_dang_nhap VARCHAR(100) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(20) DEFAULT 'customer',
    ngay_sinh DATE,
    so_dien_thoai VARCHAR(15),
    dia_chi TEXT,
    trang_thai VARCHAR(20) DEFAULT 'active',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng đơn hàng
CREATE TABLE IF NOT EXISTS don_hang (
    ma_don_hang INT AUTO_INCREMENT PRIMARY KEY,
    ma_nguoi_dung INT NOT NULL,
    ten_nguoi_dung VARCHAR(100) NOT NULL,
    so_sim VARCHAR(15) NOT NULL,
    nha_mang VARCHAR(50) NOT NULL,
    gia_mua DECIMAL(15, 0) NOT NULL,
    loai_sim VARCHAR(100),
    ten_khach_hang VARCHAR(100) NOT NULL,
    sdt_khach_hang VARCHAR(15) NOT NULL,
    dia_chi_khach_hang TEXT NOT NULL,
    phuong_thuc_thanh_toan VARCHAR(50) NOT NULL,
    trang_thai VARCHAR(50) DEFAULT 'Chờ duyệt',
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,
    transaction_id VARCHAR(255),
    ghi_chu TEXT,
    ngay_mua TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_duyet TIMESTAMP NULL,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng lịch sử xem phong thủy
CREATE TABLE IF NOT EXISTS lich_su_phong_thuy (
    ma_lich_su INT AUTO_INCREMENT PRIMARY KEY,
    ma_nguoi_dung INT NOT NULL,
    ten_nguoi_dung VARCHAR(100) NOT NULL,
    ngay_sinh DATE NOT NULL,
    gio_sinh VARCHAR(10),
    gioi_tinh VARCHAR(10) NOT NULL,
    loai_lich VARCHAR(10) NOT NULL,
    menh VARCHAR(20) NOT NULL,
    so_may_man VARCHAR(100),
    ngay_xem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng lịch sử phân tích nhu cầu
CREATE TABLE IF NOT EXISTS lich_su_phan_tich (
    ma_lich_su INT AUTO_INCREMENT PRIMARY KEY,
    ma_nguoi_dung INT NOT NULL,
    ten_nguoi_dung VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    so_may_man VARCHAR(100),
    ngan_sach DECIMAL(15, 0),
    nha_mang_mong_muon VARCHAR(50),
    muc_dich TEXT,
    so_ket_qua INT DEFAULT 0,
    ngay_tim_kiem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng tin nhắn liên hệ
CREATE TABLE IF NOT EXISTS tin_nhan (
    ma_tin_nhan INT AUTO_INCREMENT PRIMARY KEY,
    ten_nguoi_gui VARCHAR(100) NOT NULL,
    sdt_nguoi_gui VARCHAR(15) NOT NULL,
    email_nguoi_gui VARCHAR(100),
    noi_dung TEXT NOT NULL,
    trang_thai VARCHAR(20) DEFAULT 'unread',
    ngay_gui TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Thêm user admin (password: admin123)
INSERT IGNORE INTO nguoi_dung (ten_dang_nhap, mat_khau, vai_tro, ngay_sinh, so_dien_thoai, dia_chi) VALUES
('admin', 'admin123', 'admin', '1990-01-01', '0912345678', 'Hà Nội'),
('user1', 'user123', 'customer', '1995-05-15', '0987654321', 'TP.HCM'),
('user2', 'user123', 'customer', '2000-12-20', '0901234567', 'Đà Nẵng');

-- Thêm sim mẫu
INSERT INTO the_sim (so_sim, nha_mang, gia_ban, loai_sim, menh_phong_thuy, diem_nut, trang_thai, mo_ta, so_lan_tim_kiem) VALUES
('0981234567', 'Viettel', 1500000, 'Sim thần tài', 'Kim', 8, 'Còn hàng', 'Sim đẹp, hợp mệnh Kim', 15),
('0912223334', 'Vinaphone', 2000000, 'Sim tam hoa', 'Mộc', 7, 'Còn hàng', 'Sim tam hoa đẹp', 8),
('0909999888', 'Mobifone', 5000000, 'Sim tứ quý', 'Thủy', 9, 'Còn hàng', 'Sim tứ quý số 9 cực đẹp', 25),
('0988668866', 'Viettel', 4500000, 'Sim lộc phát', 'Hỏa', 6, 'Còn hàng', 'Sim lộc phát 68', 12),
('0911112222', 'Vinaphone', 6000000, 'Sim tứ quý', 'Thổ', 4, 'Còn hàng', 'Sim tứ quý 1 và 2', 10),
('0903456789', 'Mobifone', 2500000, 'Sim sảnh tiến', 'Kim', 5, 'Còn hàng', 'Sim sảnh tiến liên tục', 7),
('0987111222', 'Viettel', 1200000, 'Sim tam hoa', 'Mộc', 8, 'Còn hàng', 'Sim tam hoa 1 và 2', 6),
('0913999999', 'Vinaphone', 10000000, 'Sim ngũ quý', 'Thủy', 9, 'Còn hàng', 'Sim ngũ quý số 9 cực hiếm', 50),
('0905123123', 'Mobifone', 1800000, 'Sim lặp', 'Hỏa', 6, 'Còn hàng', 'Sim lặp 123', 9),
('0983333333', 'Viettel', 15000000, 'Sim lục quý', 'Thổ', 9, 'Còn hàng', 'Sim lục quý số 3', 40),
('0912797979', 'Vinaphone', 3000000, 'Sim thần tài lớn', 'Kim', 8, 'Còn hàng', 'Sim thần tài 79 79', 18),
('0908686868', 'Mobifone', 3500000, 'Sim lộc phát', 'Mộc', 7, 'Còn hàng', 'Sim lộc phát 68 68', 14),
('0986110204', 'Viettel', 800000, 'Sim ngày sinh', 'Thủy', 5, 'Còn hàng', 'Sim có ngày tháng năm sinh', 5),
('0915220305', 'Vinaphone', 850000, 'Sim năm sinh', 'Hỏa', 6, 'Còn hàng', 'Sim có năm sinh 2203', 4),
('0901235678', 'Mobifone', 900000, 'Sim dễ nhớ', 'Thổ', 8, 'Còn hàng', 'Sim sảnh tiến dễ nhớ', 11);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_sim_status ON the_sim(trang_thai);
CREATE INDEX idx_sim_network ON the_sim(nha_mang);
CREATE INDEX idx_sim_price ON the_sim(gia_ban);
CREATE INDEX idx_sim_search_count ON the_sim(so_lan_tim_kiem);
CREATE INDEX idx_user_status ON nguoi_dung(trang_thai);
CREATE INDEX idx_order_status ON don_hang(trang_thai);
CREATE INDEX idx_order_payment ON don_hang(payment_status);
CREATE INDEX idx_order_sim ON don_hang(so_sim);
