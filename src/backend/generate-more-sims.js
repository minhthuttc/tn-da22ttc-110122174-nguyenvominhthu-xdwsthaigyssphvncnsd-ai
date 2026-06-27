const mysql = require('mysql2/promise');

// Hàm tạo số điện thoại ngẫu nhiên
function generateRandomPhone(prefix) {
  const remainingDigits = 10 - prefix.length;
  let number = prefix;
  for (let i = 0; i < remainingDigits; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

// Hàm tạo số sim tam hoa (3 số giống nhau liên tiếp)
function generateTamHoa() {
  const prefixes = ['098', '091', '090', '093', '094', '096', '097', '099', '086', '088'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const triple = Math.floor(Math.random() * 10);
  const remaining = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return prefix + triple.toString().repeat(3) + remaining;
}

// Hàm tạo số sim tứ quý (4 số giống nhau liên tiếp)
function generateTuQuy() {
  const prefixes = ['098', '091', '090', '093', '094', '096', '097', '099', '086', '088'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const quad = Math.floor(Math.random() * 10);
  const remaining = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return prefix + quad.toString().repeat(4) + remaining;
}

// Hàm tạo số sim lộc phát (chứa 6 và 8)
function generateLocPhat() {
  const prefixes = ['098', '091', '090', '093', '094', '096', '097', '099', '086', '088'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const patterns = ['68', '86', '668', '688', '868', '886', '6868', '8686'];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const remaining = 10 - prefix.length - pattern.length;
  let number = prefix + pattern;
  for (let i = 0; i < remaining; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

// Hàm tạo số sim thần tài (chứa 39 hoặc 79)
function generateThanTai() {
  const prefixes = ['098', '091', '090', '093', '094', '096', '097', '099', '086', '088'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const patterns = ['39', '79', '339', '779', '397', '793'];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const remaining = 10 - prefix.length - pattern.length;
  let number = prefix + pattern;
  for (let i = 0; i < remaining; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

// Hàm tạo số sim dễ nhớ (dãy số tăng dần hoặc lặp lại)
function generateDeNho() {
  const prefixes = ['098', '091', '090', '093', '094', '096', '097', '099', '086', '088'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const patterns = [
    '123456', '234567', '345678', '456789',
    '111222', '222333', '333444', '444555',
    '121212', '232323', '343434', '454545'
  ];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  return prefix + pattern.substring(0, 10 - prefix.length);
}

// Hàm tạo số sim năm sinh
function generateNamSinh() {
  const prefixes = ['098', '091', '090', '093', '094', '096', '097', '099', '086', '088'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const years = [1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005];
  const year = years[Math.floor(Math.random() * years.length)];
  const remaining = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return prefix + remaining + year;
}

// Hàm random mạng
function getRandomNetwork() {
  const networks = ['Viettel', 'Vinaphone', 'Mobifone'];
  return networks[Math.floor(Math.random() * networks.length)];
}

// Hàm random ngũ hành
function getRandomElement() {
  const elements = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
  return elements[Math.floor(Math.random() * elements.length)];
}

// Hàm random giá theo loại sim
function getPrice(category) {
  switch(category) {
    case 'Sim tứ quý':
      return Math.floor(Math.random() * (5000000 - 1500000) + 1500000);
    case 'Sim tam hoa':
      return Math.floor(Math.random() * (3000000 - 800000) + 800000);
    case 'Sim thần tài':
      return Math.floor(Math.random() * (2500000 - 600000) + 600000);
    case 'Sim lộc phát':
      return Math.floor(Math.random() * (2800000 - 650000) + 650000);
    case 'Sim dễ nhớ':
      return Math.floor(Math.random() * (2000000 - 500000) + 500000);
    case 'Sim năm sinh':
      return Math.floor(Math.random() * (1500000 - 500000) + 500000);
    default:
      return Math.floor(Math.random() * (1000000 - 400000) + 400000);
  }
}

async function generateMoreSims() {
  try {
    console.log('Kết nối tới MySQL...');
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Thu2220403',
      database: 'ai_sim_db'
    });

    console.log('Đang tạo nhiều số sim mới...');
    
    const newSims = [];
    
    // Tạo 100 sim tứ quý
    for (let i = 0; i < 100; i++) {
      const simNumber = generateTuQuy();
      newSims.push([
        simNumber,
        getRandomNetwork(),
        getPrice('Sim tứ quý'),
        'Sim tứ quý',
        getRandomElement(),
        Math.floor(Math.random() * 3) + 7, // 7-9 nốt
        'Còn hàng'
      ]);
    }
    
    // Tạo 150 sim tam hoa
    for (let i = 0; i < 150; i++) {
      const simNumber = generateTamHoa();
      newSims.push([
        simNumber,
        getRandomNetwork(),
        getPrice('Sim tam hoa'),
        'Sim tam hoa',
        getRandomElement(),
        Math.floor(Math.random() * 3) + 6, // 6-8 nốt
        'Còn hàng'
      ]);
    }
    
    // Tạo 200 sim lộc phát
    for (let i = 0; i < 200; i++) {
      const simNumber = generateLocPhat();
      newSims.push([
        simNumber,
        getRandomNetwork(),
        getPrice('Sim lộc phát'),
        'Sim lộc phát',
        getRandomElement(),
        Math.floor(Math.random() * 3) + 6, // 6-8 nốt
        'Còn hàng'
      ]);
    }
    
    // Tạo 200 sim thần tài
    for (let i = 0; i < 200; i++) {
      const simNumber = generateThanTai();
      newSims.push([
        simNumber,
        getRandomNetwork(),
        getPrice('Sim thần tài'),
        'Sim thần tài',
        getRandomElement(),
        Math.floor(Math.random() * 3) + 6, // 6-8 nốt
        'Còn hàng'
      ]);
    }
    
    // Tạo 150 sim dễ nhớ
    for (let i = 0; i < 150; i++) {
      const simNumber = generateDeNho();
      newSims.push([
        simNumber,
        getRandomNetwork(),
        getPrice('Sim dễ nhớ'),
        'Sim dễ nhớ',
        getRandomElement(),
        Math.floor(Math.random() * 3) + 7, // 7-9 nốt
        'Còn hàng'
      ]);
    }
    
    // Tạo 200 sim năm sinh
    for (let i = 0; i < 200; i++) {
      const simNumber = generateNamSinh();
      newSims.push([
        simNumber,
        getRandomNetwork(),
        getPrice('Sim năm sinh'),
        'Sim năm sinh',
        getRandomElement(),
        Math.floor(Math.random() * 3) + 5, // 5-7 nốt
        'Còn hàng'
      ]);
    }

    console.log(`Đã tạo ${newSims.length} số sim mới`);
    console.log('Đang thêm vào database...');

    // Thêm vào database theo batch để tránh quá tải
    const batchSize = 100;
    for (let i = 0; i < newSims.length; i += batchSize) {
      const batch = newSims.slice(i, i + batchSize);
      const sql = `INSERT INTO sim_cards (sim_number, network, price, category, feng_shui_element, total_nodes, status) VALUES ?`;
      await connection.query(sql, [batch]);
      console.log(`Đã thêm ${Math.min(i + batchSize, newSims.length)}/${newSims.length} sim`);
    }

    console.log('Hoàn tất! Đã thêm 1000 số sim mới vào kho.');
    
    // Kiểm tra tổng số sim
    const [result] = await connection.query('SELECT COUNT(*) as total FROM sim_cards');
    console.log(`Tổng số sim trong kho: ${result[0].total}`);

    await connection.end();
  } catch (err) {
    console.error('Lỗi khi tạo sim:', err);
    process.exit(1);
  }
}

generateMoreSims();
