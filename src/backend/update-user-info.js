const mysql = require('mysql2/promise');

async function updateUserInfo() {
  let connection;
  
  try {
    // Kết nối database
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Thu2220403',
      database: 'ai_sim_db'
    });

    console.log('🔗 Đã kết nối database\n');

    // Cập nhật thông tin
    const [result] = await connection.execute(
      'UPDATE users SET phone = ?, address = ? WHERE name = ?',
      ['0382286177', '282, Nguyễn Thị Minh Khai, Trà Vinh', 'Nguyễn Võ Minh Thư']
    );

    console.log('✅ Đã cập nhật thông tin tài khoản!');
    console.log(`   Số dòng được cập nhật: ${result.affectedRows}\n`);

    // Kiểm tra thông tin mới
    const [rows] = await connection.execute(
      'SELECT id, name, phone, address, email, role FROM users WHERE name = ?',
      ['Nguyễn Võ Minh Thư']
    );

    if (rows.length > 0) {
      console.log('📋 Thông tin tài khoản sau khi cập nhật:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Tên: ${rows[0].name}`);
      console.log(`   Email: ${rows[0].email}`);
      console.log(`   SĐT: ${rows[0].phone}`);
      console.log(`   Địa chỉ: ${rows[0].address}`);
      console.log(`   Vai trò: ${rows[0].role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('✨ Hoàn tất! Vui lòng đăng xuất và đăng nhập lại để cập nhật thông tin.');

  } catch (error) {
    console.error('❌ LỖI:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối database');
    }
  }
}

updateUserInfo();
