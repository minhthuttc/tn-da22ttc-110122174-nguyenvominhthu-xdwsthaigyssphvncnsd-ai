const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sim_db',
  waitForConnections: true,
  connectionLimit: 10,
});

async function updateSoldSims() {
  try {
    console.log('🔍 Đang tìm các sim đã được duyệt nhưng vẫn còn trạng thái "Còn hàng"...\n');
    
    // Tìm các sim trong đơn hàng "Đã duyệt" nhưng vẫn có trạng thái "Còn hàng"
    const [sims] = await pool.query(`
      SELECT DISTINCT dh.so_sim, ts.trang_thai
      FROM don_hang dh
      JOIN the_sim ts ON dh.so_sim = ts.so_sim
      WHERE dh.trang_thai = 'Đã duyệt' AND ts.trang_thai = 'Còn hàng'
    `);
    
    if (sims.length === 0) {
      console.log('✅ Không có sim nào cần cập nhật!');
      process.exit(0);
    }
    
    console.log(`📋 Tìm thấy ${sims.length} sim cần cập nhật:`);
    sims.forEach(sim => {
      console.log(`   - ${sim.so_sim}`);
    });
    
    console.log('\n🔧 Đang cập nhật trạng thái thành "Đã bán"...');
    
    const [result] = await pool.query(`
      UPDATE the_sim ts
      JOIN don_hang dh ON ts.so_sim = dh.so_sim
      SET ts.trang_thai = 'Đã bán'
      WHERE dh.trang_thai = 'Đã duyệt' AND ts.trang_thai = 'Còn hàng'
    `);
    
    console.log(`\n✅ Đã cập nhật ${result.affectedRows} sim!\n`);
    
    // Kiểm tra lại
    const [check] = await pool.query(`
      SELECT so_sim, trang_thai FROM the_sim WHERE trang_thai = 'Đã bán' LIMIT 5
    `);
    
    console.log('📊 Trạng thái sau khi cập nhật (5 sim đầu):');
    check.forEach(sim => {
      console.log(`   - ${sim.so_sim}: ${sim.trang_thai}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updateSoldSims();
