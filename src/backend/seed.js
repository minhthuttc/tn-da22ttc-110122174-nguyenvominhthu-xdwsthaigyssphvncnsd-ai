const mysql = require('mysql2/promise');

async function seed() {
  try {
    console.log('Connecting to MySQL...');
    // Connect without a specific database first to create it
    let connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Thu2220403'
    });

    console.log('Creating database ai_sim_db if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS ai_sim_db');
    await connection.end();

    // Reconnect to the newly created database
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Thu2220403',
      database: 'ai_sim_db'
    });

    console.log('Creating sim_cards table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sim_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sim_number VARCHAR(15) NOT NULL,
        network VARCHAR(50) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        category VARCHAR(50),
        feng_shui_element VARCHAR(20),
        total_nodes INT,
        status VARCHAR(20) DEFAULT 'Còn hàng'
      )
    `);

    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Thêm admin mặc định
    const [adminExists] = await connection.query('SELECT * FROM users WHERE name = ?', ['Admin']);
    if (adminExists.length === 0) {
      await connection.query(
        'INSERT INTO users (name, password, role) VALUES (?, ?, ?)',
        ['Admin', 'admin123', 'admin']
      );
      console.log('Admin account created: Admin / admin123');
    }

    console.log('Truncating table... (Cleaning old data)');
    await connection.query('TRUNCATE TABLE sim_cards');

    console.log('Inserting mock data...');
    const data = [
      // Sim Tam Hoa (500k - 5tr)
      ['0981222333', 'Viettel', 800000, 'Sim tam hoa', 'Kim', 7, 'Còn hàng'],
      ['0912223334', 'Vinaphone', 950000, 'Sim tam hoa', 'Mộc', 7, 'Còn hàng'],
      ['0909888777', 'Mobifone', 1200000, 'Sim tam hoa', 'Thủy', 8, 'Còn hàng'],
      ['0987111222', 'Viettel', 1100000, 'Sim tam hoa', 'Mộc', 8, 'Còn hàng'],
      ['0916666555', 'Vinaphone', 1500000, 'Sim tam hoa', 'Hỏa', 7, 'Còn hàng'],
      ['0903777888', 'Mobifone', 1800000, 'Sim tam hoa', 'Kim', 8, 'Còn hàng'],
      ['0988444555', 'Viettel', 2200000, 'Sim tam hoa', 'Thổ', 7, 'Còn hàng'],
      ['0911333222', 'Vinaphone', 2500000, 'Sim tam hoa', 'Mộc', 8, 'Còn hàng'],
      ['0907999888', 'Mobifone', 3000000, 'Sim tam hoa', 'Thủy', 9, 'Còn hàng'],
      ['0985777666', 'Viettel', 3500000, 'Sim tam hoa', 'Hỏa', 8, 'Còn hàng'],
      ['0914555444', 'Vinaphone', 4000000, 'Sim tam hoa', 'Kim', 7, 'Còn hàng'],
      ['0902888999', 'Mobifone', 4500000, 'Sim tam hoa', 'Thổ', 9, 'Còn hàng'],
      
      // Sim Tứ Quý (500k - 5tr)
      ['0981111234', 'Viettel', 1500000, 'Sim tứ quý', 'Kim', 8, 'Còn hàng'],
      ['0912222567', 'Vinaphone', 1800000, 'Sim tứ quý', 'Mộc', 8, 'Còn hàng'],
      ['0909999888', 'Mobifone', 2500000, 'Sim tứ quý', 'Thủy', 9, 'Còn hàng'],
      ['0987777456', 'Viettel', 2800000, 'Sim tứ quý', 'Hỏa', 8, 'Còn hàng'],
      ['0916666789', 'Vinaphone', 3200000, 'Sim tứ quý', 'Thổ', 9, 'Còn hàng'],
      ['0903333890', 'Mobifone', 3500000, 'Sim tứ quý', 'Kim', 8, 'Còn hàng'],
      ['0988888123', 'Viettel', 4000000, 'Sim tứ quý', 'Mộc', 9, 'Còn hàng'],
      ['0911111456', 'Vinaphone', 4200000, 'Sim tứ quý', 'Thủy', 8, 'Còn hàng'],
      ['0907777234', 'Mobifone', 4500000, 'Sim tứ quý', 'Hỏa', 9, 'Còn hàng'],
      ['0985555678', 'Viettel', 4800000, 'Sim tứ quý', 'Thổ', 8, 'Còn hàng'],
      
      // Sim Thần Tài (500k - 5tr)
      ['0981239567', 'Viettel', 600000, 'Sim thần tài', 'Kim', 7, 'Còn hàng'],
      ['0912793456', 'Vinaphone', 750000, 'Sim thần tài', 'Mộc', 7, 'Còn hàng'],
      ['0909397890', 'Mobifone', 900000, 'Sim thần tài', 'Thủy', 8, 'Còn hàng'],
      ['0987793234', 'Viettel', 1100000, 'Sim thần tài', 'Hỏa', 7, 'Còn hàng'],
      ['0916397567', 'Vinaphone', 1300000, 'Sim thần tài', 'Thổ', 8, 'Còn hàng'],
      ['0903793890', 'Mobifone', 1500000, 'Sim thần tài', 'Kim', 7, 'Còn hàng'],
      ['0988397123', 'Viettel', 1800000, 'Sim thần tài', 'Mộc', 8, 'Còn hàng'],
      ['0911793456', 'Vinaphone', 2200000, 'Sim thần tài', 'Thủy', 7, 'Còn hàng'],
      ['0907397234', 'Mobifone', 2500000, 'Sim thần tài', 'Hỏa', 8, 'Còn hàng'],
      ['0985793678', 'Viettel', 3000000, 'Sim thần tài', 'Thổ', 8, 'Còn hàng'],
      ['0914397890', 'Vinaphone', 3500000, 'Sim thần tài', 'Kim', 7, 'Còn hàng'],
      ['0902793123', 'Mobifone', 4000000, 'Sim thần tài', 'Mộc', 8, 'Còn hàng'],
      ['0986397456', 'Viettel', 4500000, 'Sim thần tài', 'Thủy', 9, 'Còn hàng'],
      ['0913793789', 'Vinaphone', 4800000, 'Sim thần tài', 'Hỏa', 8, 'Còn hàng'],
      
      // Sim Lộc Phát (500k - 5tr)
      ['0981686234', 'Viettel', 650000, 'Sim lộc phát', 'Kim', 7, 'Còn hàng'],
      ['0912868567', 'Vinaphone', 800000, 'Sim lộc phát', 'Mộc', 7, 'Còn hàng'],
      ['0909786890', 'Mobifone', 950000, 'Sim lộc phát', 'Thủy', 8, 'Còn hàng'],
      ['0987868123', 'Viettel', 1200000, 'Sim lộc phát', 'Hỏa', 7, 'Còn hàng'],
      ['0916686456', 'Vinaphone', 1400000, 'Sim lộc phát', 'Thổ', 8, 'Còn hàng'],
      ['0903786789', 'Mobifone', 1600000, 'Sim lộc phát', 'Kim', 7, 'Còn hàng'],
      ['0988686868', 'Viettel', 1900000, 'Sim lộc phát', 'Mộc', 8, 'Còn hàng'],
      ['0911868234', 'Vinaphone', 2300000, 'Sim lộc phát', 'Thủy', 7, 'Còn hàng'],
      ['0907786567', 'Mobifone', 2600000, 'Sim lộc phát', 'Hỏa', 8, 'Còn hàng'],
      ['0985868890', 'Viettel', 3100000, 'Sim lộc phát', 'Thổ', 8, 'Còn hàng'],
      ['0914686123', 'Vinaphone', 3600000, 'Sim lộc phát', 'Kim', 7, 'Còn hàng'],
      ['0902786456', 'Mobifone', 4100000, 'Sim lộc phát', 'Mộc', 8, 'Còn hàng'],
      ['0986868789', 'Viettel', 4600000, 'Sim lộc phát', 'Thủy', 9, 'Còn hàng'],
      ['0913786234', 'Vinaphone', 4900000, 'Sim lộc phát', 'Hỏa', 8, 'Còn hàng'],
      
      // Sim khác (đa dạng)
      ['0986110204', 'Viettel', 800000, 'Sim ngày tháng năm sinh', 'Thủy', 5, 'Còn hàng'],
      ['0915220305', 'Vinaphone', 850000, 'Sim năm sinh', 'Hỏa', 6, 'Còn hàng'],
      ['0901235678', 'Mobifone', 900000, 'Sim dễ nhớ', 'Thổ', 8, 'Còn hàng'],
      
      // Sim ngày sinh phổ biến (500k - 5tr)
      ['0981010190', 'Viettel', 650000, 'Sim ngày sinh 01/01/1990', 'Kim', 6, 'Còn hàng'],
      ['0912220495', 'Vinaphone', 700000, 'Sim ngày sinh 22/04/1995', 'Mộc', 7, 'Còn hàng'],
      ['0909150398', 'Mobifone', 750000, 'Sim ngày sinh 15/03/1998', 'Thủy', 6, 'Còn hàng'],
      ['0987100292', 'Viettel', 800000, 'Sim ngày sinh 10/02/1992', 'Hỏa', 7, 'Còn hàng'],
      ['0916250599', 'Vinaphone', 850000, 'Sim ngày sinh 25/05/1999', 'Thổ', 6, 'Còn hàng'],
      ['0903081296', 'Mobifone', 900000, 'Sim ngày sinh 08/12/1996', 'Kim', 7, 'Còn hàng'],
      ['0988301094', 'Viettel', 950000, 'Sim ngày sinh 30/10/1994', 'Mộc', 6, 'Còn hàng'],
      ['0911180797', 'Vinaphone', 1000000, 'Sim ngày sinh 18/07/1997', 'Thủy', 7, 'Còn hàng'],
      ['0907050693', 'Mobifone', 1100000, 'Sim ngày sinh 05/06/1993', 'Hỏa', 6, 'Còn hàng'],
      ['0985120891', 'Viettel', 1200000, 'Sim ngày sinh 12/08/1991', 'Thổ', 7, 'Còn hàng'],
      ['0914280900', 'Vinaphone', 1300000, 'Sim ngày sinh 28/09/2000', 'Kim', 6, 'Còn hàng'],
      ['0902141101', 'Mobifone', 1400000, 'Sim ngày sinh 14/11/2001', 'Mộc', 7, 'Còn hàng'],
      ['0986200402', 'Viettel', 1500000, 'Sim ngày sinh 20/04/2002', 'Thủy', 6, 'Còn hàng'],
      ['0913030303', 'Vinaphone', 1600000, 'Sim ngày sinh 03/03/2003', 'Hỏa', 7, 'Còn hàng'],
      ['0908170688', 'Mobifone', 1700000, 'Sim ngày sinh 17/06/1988', 'Thổ', 6, 'Còn hàng'],
      ['0989221289', 'Viettel', 1800000, 'Sim ngày sinh 22/12/1989', 'Kim', 7, 'Còn hàng'],
      ['0917090187', 'Vinaphone', 1900000, 'Sim ngày sinh 09/01/1987', 'Mộc', 6, 'Còn hàng'],
      ['0904111186', 'Mobifone', 2000000, 'Sim ngày sinh 11/11/1986', 'Thủy', 7, 'Còn hàng'],
      
      // Sim ngày kỷ niệm phổ biến (500k - 5tr)
      ['0981010123', 'Viettel', 600000, 'Sim ngày kỷ niệm 01/01', 'Kim', 6, 'Còn hàng'],
      ['0912140256', 'Vinaphone', 650000, 'Sim ngày kỷ niệm 14/02', 'Mộc', 7, 'Còn hàng'],
      ['0909080389', 'Mobifone', 700000, 'Sim ngày kỷ niệm 08/03', 'Thủy', 6, 'Còn hàng'],
      ['0987200412', 'Viettel', 750000, 'Sim ngày kỷ niệm 20/04', 'Hỏa', 7, 'Còn hàng'],
      ['0916010545', 'Vinaphone', 800000, 'Sim ngày kỷ niệm 01/05', 'Thổ', 6, 'Còn hàng'],
      ['0903010678', 'Mobifone', 850000, 'Sim ngày kỷ niệm 01/06', 'Kim', 7, 'Còn hàng'],
      ['0988200711', 'Viettel', 900000, 'Sim ngày kỷ niệm 20/07', 'Mộc', 6, 'Còn hàng'],
      ['0911150844', 'Vinaphone', 950000, 'Sim ngày kỷ niệm 15/08', 'Thủy', 7, 'Còn hàng'],
      ['0907020977', 'Mobifone', 1000000, 'Sim ngày kỷ niệm 02/09', 'Hỏa', 6, 'Còn hàng'],
      ['0985201010', 'Viettel', 1100000, 'Sim ngày kỷ niệm 20/10', 'Thổ', 7, 'Còn hàng'],
      ['0914111143', 'Vinaphone', 1200000, 'Sim ngày kỷ niệm 11/11', 'Kim', 6, 'Còn hàng'],
      ['0902251276', 'Mobifone', 1300000, 'Sim ngày kỷ niệm 25/12', 'Mộc', 7, 'Còn hàng'],
      ['0986241209', 'Viettel', 1400000, 'Sim ngày kỷ niệm 24/12', 'Thủy', 6, 'Còn hàng'],
      ['0913100542', 'Vinaphone', 1500000, 'Sim ngày kỷ niệm 10/05', 'Hỏa', 7, 'Còn hàng'],
      ['0908220675', 'Mobifone', 1600000, 'Sim ngày kỷ niệm 22/06', 'Thổ', 6, 'Còn hàng'],
      ['0989300708', 'Viettel', 1700000, 'Sim ngày kỷ niệm 30/07', 'Kim', 7, 'Còn hàng'],
      ['0917050831', 'Vinaphone', 1800000, 'Sim ngày kỷ niệm 05/08', 'Mộc', 6, 'Còn hàng'],
      ['0904180964', 'Mobifone', 1900000, 'Sim ngày kỷ niệm 18/09', 'Thủy', 7, 'Còn hàng'],
      
      // Sim năm sinh phổ biến (500k - 5tr)
      ['0981231990', 'Viettel', 550000, 'Sim năm sinh 1990', 'Kim', 6, 'Còn hàng'],
      ['0912341991', 'Vinaphone', 600000, 'Sim năm sinh 1991', 'Mộc', 6, 'Còn hàng'],
      ['0909451992', 'Mobifone', 650000, 'Sim năm sinh 1992', 'Thủy', 6, 'Còn hàng'],
      ['0987561993', 'Viettel', 700000, 'Sim năm sinh 1993', 'Hỏa', 6, 'Còn hàng'],
      ['0916671994', 'Vinaphone', 750000, 'Sim năm sinh 1994', 'Thổ', 6, 'Còn hàng'],
      ['0903781995', 'Mobifone', 800000, 'Sim năm sinh 1995', 'Kim', 6, 'Còn hàng'],
      ['0988891996', 'Viettel', 850000, 'Sim năm sinh 1996', 'Mộc', 6, 'Còn hàng'],
      ['0911901997', 'Vinaphone', 900000, 'Sim năm sinh 1997', 'Thủy', 6, 'Còn hàng'],
      ['0907011998', 'Mobifone', 950000, 'Sim năm sinh 1998', 'Hỏa', 6, 'Còn hàng'],
      ['0985121999', 'Viettel', 1000000, 'Sim năm sinh 1999', 'Thổ', 6, 'Còn hàng'],
      ['0914232000', 'Vinaphone', 1100000, 'Sim năm sinh 2000', 'Kim', 6, 'Còn hàng'],
      ['0902342001', 'Mobifone', 1200000, 'Sim năm sinh 2001', 'Mộc', 6, 'Còn hàng'],
      ['0986452002', 'Viettel', 1300000, 'Sim năm sinh 2002', 'Thủy', 6, 'Còn hàng'],
      ['0913562003', 'Vinaphone', 1400000, 'Sim năm sinh 2003', 'Hỏa', 6, 'Còn hàng'],
      ['0908672004', 'Mobifone', 1500000, 'Sim năm sinh 2004', 'Thổ', 6, 'Còn hàng']
    ];

    const sql = `INSERT INTO sim_cards (sim_number, network, price, category, feng_shui_element, total_nodes, status) VALUES ?`;
    await connection.query(sql, [data]);

    console.log('Database seeded successfully!');
    await connection.end();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
