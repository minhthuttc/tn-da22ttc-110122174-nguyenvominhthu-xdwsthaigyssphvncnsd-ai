const mysql = require('mysql2/promise');

async function addUserColumns() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Thu2220403',
      database: 'ai_sim_db'
    });

    console.log('🔗 Đã kết nối database\n');

    // Thêm cột phone
    try {
      await connection.execute(
        'ALTER TABLE users ADD COLUMN phone VARCHAR(15) NULL AFTER name'
      );
      console.log('✅ Đã thêm cột phone');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Cột phone đã tồn tại');
      } else {
        throw err;
      }
    }

    // Thêm cột address
    try {
      await connection.execute(
        'ALTER TABLE users ADD COLUMN address TEXT NULL AFTER phone'
      );
      console.log('✅ Đã thêm cột address\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Cột address đã tồn tại\n');
      } else {
        throw err;
      }
    }

    // Hiển thị cấu trúc bảng mới
    const [cols] = await connection.execute('DESCRIBE users');
    console.log('📋 Cấu trúc bảng users sau khi cập nhật:');
    console.table(cols.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key
    })));

    // Cập nhật thông tin cho Nguyễn Võ Minh Thư
    console.log('\n🔄 Đang cập nhật thông tin Nguyễn Võ Minh Thư...');
    const [result] = await connection.execute(
      'UPDATE users SET phone = ?, address = ? WHERE name = ?',
      ['0382286177', '282, Nguyễn Thị Minh Khai, Trà Vinh', 'Nguyễn Võ Minh Thư']
    );

    console.log(`✅ Đã cập nhật ${result.affectedRows} tài khoản\n`);

    // Hiển thị thông tin
    const [rows] = await connection.execute(
      'SELECT id, name, phone, address, role FROM users WHERE name = ?',
      ['Nguyễn Võ Minh Thư']
    );

    if (rows.length > 0) {
      console.log('📋 Thông tin tài khoản:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Tên: ${rows[0].name}`);
      console.log(`   SĐT: ${rows[0].phone}`);
      console.log(`   Địa chỉ: ${rows[0].address}`);
      console.log(`   Vai trò: ${rows[0].role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('✨ Hoàn tất! Đăng xuất và đăng nhập lại để cập nhật.');

  } catch (error) {
    console.error('❌ LỖI:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối');
    }
  }
}

addUserColumns();
