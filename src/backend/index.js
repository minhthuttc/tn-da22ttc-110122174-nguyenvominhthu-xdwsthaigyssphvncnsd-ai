const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDL7YqR8K7v8K7v8K7v8K7v8K7v8K7v8K7'); // Thay bằng API key thật

// MySQL connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mock weights
const w1 = 0.5; // Phong thủy
const w2 = 0.4; // Sở thích
const w3 = 0.1; // Hành vi

// API phân tích phong thủy bằng AI
app.post('/api/fengshui-ai-analysis', async (req, res) => {
  try {
    const { birthDate, birthTime, gender, calendarType } = req.body;
    
    // Chuẩn bị prompt cho AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
Bạn là chuyên gia phong thủy Việt Nam uy tín, có kiến thức sâu về:
- Nạp Âm 60 năm
- Can Chi năm sinh
- 12 Giờ Địa Chi
- Ngũ hành tương sinh tương khắc
- Phân tích mệnh số chi tiết

Hãy phân tích phong thủy chi tiết và CHÍNH XÁC cho người sau:
- Ngày sinh: ${birthDate} (${calendarType === 'solar' ? 'Dương lịch' : 'Âm lịch'})
${birthTime ? `- Giờ sinh: ${birthTime}` : ''}
- Giới tính: ${gender === 'male' ? 'Nam' : 'Nữ'}

YÊU CẦU PHÂN TÍCH:
1. Tính CHÍNH XÁC mệnh ngũ hành theo Nạp Âm (không phải công thức đơn giản)
2. Tính Can Chi năm sinh
${birthTime ? '3. Phân tích giờ sinh theo 12 Giờ Địa Chi và tương sinh khắc với mệnh năm' : ''}
4. Phân tích tính cách chi tiết dựa trên mệnh và giờ sinh (nếu có)
5. Đưa ra 3 con số may mắn CHÍNH XÁC nhất (dựa trên Hà Đồ Lạc Thư)
6. Gợi ý màu sắc may mắn (tối thiểu 3 màu)
7. Hướng may mắn (chi tiết cho giới tính)
8. Nghề nghiệp phù hợp (liệt kê cụ thể 5-7 nghề)
9. Phân tích tình duyên (mệnh hợp, mệnh tránh, và lời khuyên cụ thể)
10. Phân tích tài lộc (chi tiết về xu hướng tài chính, cách đầu tư)
11. Lời khuyên phong thủy thực tế (tối thiểu 5 lời khuyên cụ thể)

QUAN TRỌNG: 
- Phân tích phải DỰA TRÊN NGÀY SINH THẬT, không chung chung
- Mỗi người sinh ngày khác nhau sẽ có phân tích KHÁC NHAU
- Trả về JSON với format sau (chỉ trả JSON, không thêm text khác):

{
  "element": "Kim|Mộc|Thủy|Hỏa|Thổ",
  "canChiYear": "Giáp Thìn",
  "luckyNumbers": [4, 9, 5],
  "luckyColors": ["Trắng", "Vàng", "Nâu"],
  "direction": "Tây, Tây Bắc",
  "birthHourInfo": ${birthTime ? '{"name": "Giờ Tý", "range": "23:00-01:00", "element": "Thủy", "trait": "Thông minh, linh hoạt"}' : 'null'},
  "hourCompatibility": ${birthTime ? '{"type": "sinh|khắc|bình", "desc": "Mô tả chi tiết"}' : 'null'},
  "personality": "Phân tích tính cách chi tiết dựa trên ngày giờ sinh thật...",
  "suitableCareer": "Danh sách nghề nghiệp cụ thể...",
  "loveCompatibility": {
    "best": "Thổ, Thủy",
    "avoid": "Hỏa, Mộc",
    "advice": "Lời khuyên cụ thể về tình duyên..."
  },
  "wealthFortune": "Phân tích tài lộc chi tiết...",
  "advice": ["Lời khuyên 1", "Lời khuyên 2", "..."]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Loại bỏ markdown code block nếu có
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    const aiAnalysis = JSON.parse(text);
    
    res.json({
      success: true,
      data: aiAnalysis,
      source: 'AI',
      message: 'Phân tích bằng AI Gemini'
    });
    
  } catch (error) {
    console.error('Error in AI analysis:', error);
    // Nếu AI lỗi, trả về phân tích cơ bản
    res.status(200).json({
      success: false,
      message: 'AI tạm thời không khả dụng, vui lòng thử lại sau',
      source: 'fallback'
    });
  }
});

app.post('/api/recommend', async (req, res) => {
  try {
    const { birthDate, luckyNumbers, priceLimit, expectedNetwork } = req.body;
    
    // Fetch sim cards roughly matching price and network if provided
    let query = 'SELECT * FROM the_sim WHERE trang_thai = "Còn hàng"';
    const params = [];

    if (expectedNetwork) {
      query += ' AND nha_mang = ?';
      params.push(expectedNetwork);
    }

    if (priceLimit) {
      query += ' AND gia_ban <= ?';
      params.push(priceLimit);
    }

    const [rows] = await pool.query(query, params);

    // Filter and score
    const recommendations = rows.map(sim => {
      let fengShuiPoint = 0;
      let interestPoint = 0;
      let behaviorPoint = Math.floor(Math.random() * 5) + 5; // Mock 5-9 points
      let explanations = [];

      // 1. Calculate P (Feng Shui)
      const nodes = sim.diem_nut || 0;
      fengShuiPoint += nodes; // 1 point per node
      explanations.push(`Điểm nút sim là ${nodes}/10.`);

      if (['Sim thần tài', 'Sim lộc phát'].includes(sim.loai_sim)) {
        fengShuiPoint = Math.min(10, fengShuiPoint + 2);
        explanations.push('Chứa yếu tố chiêu tài tiến bảo.');
      }
      fengShuiPoint = Math.min(10, fengShuiPoint);

      // 2. Calculate I (Interest Point)
      const simStr = sim.so_sim;
      if (birthDate) {
        // Simple logic: if sim endswith birth year
        const year = birthDate.split('-')[0]; // Format expected YYYY-MM-DD
        if (year && simStr.endsWith(year)) {
          interestPoint += 5;
          explanations.push(`Đuôi sim chứa năm sinh ${year} của bạn.`);
        }
      }

      if (luckyNumbers && Array.isArray(luckyNumbers)) {
        let matched = 0;
        luckyNumbers.forEach(num => {
          if (simStr.includes(num)) {
            interestPoint += 2;
            matched++;
          }
        });
        if (matched > 0) {
          explanations.push(`Sim chứa ${matched} con số may mắn của bạn.`);
        }
      }
      interestPoint = Math.min(10, interestPoint);
      if (interestPoint === 0) interestPoint = 2; // base score

      // 3. Final Score
      const suitabilityScore = (w1 * fengShuiPoint) + (w2 * interestPoint) + (w3 * behaviorPoint);

      return {
        ...sim,
        fengShuiPoint,
        interestPoint,
        behaviorPoint,
        suitabilityScore: suitabilityScore.toFixed(2),
        explainableAI: explanations
      };
    });

    // Sort by S point descending
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    // Return top 10
    res.json({
      success: true,
      data: recommendations.slice(0, 10)
    });

  } catch (error) {
    console.error('Error in /api/recommend:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// API endpoint to get all sims
app.get('/api/sims', async (req, res) => {
  try {
    // Chỉ lấy sim còn hàng (không bao gồm sim đã bán)
    const [rows] = await pool.query('SELECT * FROM the_sim WHERE trang_thai = ? ORDER BY gia_ban ASC', ['Còn hàng']);
    
    // Thêm suitabilityScore mặc định cho kho sim
    const simsWithScore = rows.map(sim => ({
      ...sim,
      id: sim.ma_sim,
      sim_number: sim.so_sim,
      network: sim.nha_mang,
      price: sim.gia_ban,
      category: sim.loai_sim,
      feng_shui_element: sim.menh_phong_thuy,
      total_nodes: sim.diem_nut,
      status: sim.trang_thai,
      description: sim.mo_ta,
      search_count: sim.so_lan_tim_kiem || 0,
      suitabilityScore: 0,
      explainableAI: []
    }));
    
    res.json({
      success: true,
      data: simsWithScore
    });
  } catch (error) {
    console.error('Error in /api/sims:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// API lấy sim nổi bật (được tìm kiếm nhiều nhất) - PHẢI ĐẶT TRƯỚC /api/sims/:id
app.get('/api/sims/popular', async (req, res) => {
  try {
    // Lấy 8 sim được tìm kiếm nhiều nhất và chưa bán
    const [rows] = await pool.query(
      `SELECT * FROM the_sim 
       WHERE trang_thai = 'Còn hàng' 
       ORDER BY so_lan_tim_kiem DESC, gia_ban ASC 
       LIMIT 8`
    );
    
    const simsWithScore = rows.map(sim => ({
      ...sim,
      id: sim.ma_sim,
      sim_number: sim.so_sim,
      network: sim.nha_mang,
      price: sim.gia_ban,
      category: sim.loai_sim,
      feng_shui_element: sim.menh_phong_thuy,
      total_nodes: sim.diem_nut,
      status: sim.trang_thai,
      description: sim.mo_ta,
      search_count: sim.so_lan_tim_kiem || 0,
      suitabilityScore: sim.so_lan_tim_kiem || 0, // Dùng số lần tìm kiếm làm điểm
      explainableAI: []
    }));
    
    res.json({
      success: true,
      data: simsWithScore
    });
  } catch (error) {
    console.error('Error fetching popular sims:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API tăng số lần tìm kiếm sim
app.put('/api/sims/:id/increment-search', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE the_sim SET so_lan_tim_kiem = so_lan_tim_kiem + 1 WHERE ma_sim = ?', [id]);
    res.json({ success: true, message: 'Đã cập nhật lượt tìm kiếm' });
  } catch (error) {
    console.error('Error incrementing search:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API mua sim (tạo đơn hàng)
app.post('/api/purchase', async (req, res) => {
  console.log('\n🔵 === POST /api/purchase RECEIVED ===');
  console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
  console.log('');
  
  try {
    const { 
      user_id, 
      user_name, 
      sim_number, 
      network, 
      price, 
      category,
      customer_name,
      customer_phone,
      customer_address,
      payment_method
    } = req.body;
    
    console.log('📋 Extracted fields:');
    console.log('  - user_id:', user_id);
    console.log('  - user_name:', user_name);
    console.log('  - sim_number:', sim_number);
    console.log('  - network:', network);
    console.log('  - price:', price);
    console.log('  - category:', category);
    console.log('  - customer_name:', customer_name);
    console.log('  - customer_phone:', customer_phone);
    console.log('  - customer_address:', customer_address);
    console.log('  - payment_method:', payment_method);
    console.log('');

    // Validation
    if (!user_id || !user_name || !sim_number || !network || !price || !category || 
        !customer_name || !customer_phone || !customer_address || !payment_method) {
      console.error('❌ VALIDATION FAILED - Missing required fields:');
      if (!user_id) console.error('  - user_id is missing');
      if (!user_name) console.error('  - user_name is missing');
      if (!sim_number) console.error('  - sim_number is missing');
      if (!network) console.error('  - network is missing');
      if (!price) console.error('  - price is missing');
      if (!category) console.error('  - category is missing');
      if (!customer_name) console.error('  - customer_name is missing');
      if (!customer_phone) console.error('  - customer_phone is missing');
      if (!customer_address) console.error('  - customer_address is missing');
      if (!payment_method) console.error('  - payment_method is missing');
      
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc',
        missing: {
          user_id: !user_id,
          user_name: !user_name,
          sim_number: !sim_number,
          network: !network,
          price: !price,
          category: !category,
          customer_name: !customer_name,
          customer_phone: !customer_phone,
          customer_address: !customer_address,
          payment_method: !payment_method
        }
      });
    }
    
    console.log('✅ Validation passed');

    // Kiểm tra sim còn hàng không
    console.log('🔍 Checking if sim is available...');
    const [simCheck] = await pool.query('SELECT trang_thai FROM the_sim WHERE so_sim = ?', [sim_number]);
    if (simCheck.length === 0) {
      console.error('❌ Sim not found:', sim_number);
      return res.status(404).json({ success: false, message: 'Không tìm thấy sim' });
    }
    if (simCheck[0].trang_thai === 'Đã bán') {
      console.error('❌ Sim already sold:', sim_number);
      return res.status(400).json({ success: false, message: 'Sim đã được đặt mua' });
    }
    console.log('✅ Sim is available');

    // Tạo đơn hàng
    console.log('💾 Creating order in database...');
    const [result] = await pool.query(
      `INSERT INTO don_hang (ma_nguoi_dung, ten_nguoi_dung, so_sim, nha_mang, gia_mua, loai_sim, 
       ten_khach_hang, sdt_khach_hang, dia_chi_khach_hang, phuong_thuc_thanh_toan, trang_thai, payment_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, user_name, sim_number, network, price, category, 
       customer_name, customer_phone, customer_address, payment_method, 'Chờ duyệt', 'PENDING']
    );

    const orderId = result.insertId;
    console.log('✅ Order created with ID:', orderId);

    // KHÔNG CẬP NHẬT SIM NGAY - chỉ cập nhật khi thanh toán thành công
    console.log('ℹ️ Sim will be marked as "Đã bán" only after payment is confirmed');

    const responseData = { 
      success: true, 
      message: 'Đặt mua sim thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
      orderId: orderId,
      simNumber: sim_number
    };
    
    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
    console.log('=== END /api/purchase ===\n');
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ ERROR in /api/purchase:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo đơn hàng', error: error.message });
  }
});

// API lấy thống kê tìm kiếm sim (admin)
app.get('/api/admin/sim-search-stats', async (req, res) => {
  try {
    const [stats] = await pool.query(
      'SELECT ma_sim as id, so_sim as sim_number, nha_mang as network, gia_ban as price, menh_phong_thuy as feng_shui_element, diem_nut as total_nodes, so_lan_tim_kiem as search_count, trang_thai as status FROM the_sim WHERE so_lan_tim_kiem > 0 ORDER BY so_lan_tim_kiem DESC LIMIT 20'
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting search stats:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API đăng ký
app.post('/api/register', async (req, res) => {
  try {
    const { name, password, birthDate, phone, address } = req.body;
    
    // Kiểm tra tên đã tồn tại
    const [existing] = await pool.query('SELECT * FROM nguoi_dung WHERE ten_dang_nhap = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã được sử dụng' });
    }
    
    // Thêm user mới (với số điện thoại và địa chỉ nếu có)
    await pool.query(
      'INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, vai_tro, ngay_sinh, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?, ?)',
      [name, password, 'customer', birthDate || null, phone || null, address || null]
    );
    
    res.json({ success: true, message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Error in /api/register:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API đăng nhập
app.post('/api/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    const [users] = await pool.query('SELECT * FROM nguoi_dung WHERE ten_dang_nhap = ? AND mat_khau = ?', [name, password]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const user = users[0];
    
    // Kiểm tra tài khoản bị khóa
    if (user.trang_thai === 'locked') {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ người quản trị để mở khóa.' });
    }
    
    // Format birthDate to YYYY-MM-DD if exists (local timezone)
    let formattedBirthDate = null;
    if (user.ngay_sinh) {
      const date = new Date(user.ngay_sinh);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedBirthDate = `${year}-${month}-${day}`;
    }
    
    res.json({
      success: true,
      user: {
        id: user.ma_nguoi_dung,
        name: user.ten_dang_nhap,
        role: user.vai_tro,
        birthDate: formattedBirthDate,
        phone: user.so_dien_thoai || '',
        address: user.dia_chi || ''
      }
    });
  } catch (error) {
    console.error('Error in /api/login:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API get all users for login suggestions
app.get('/api/users/all', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT ten_dang_nhap, vai_tro FROM nguoi_dung ORDER BY ten_dang_nhap LIMIT 20'
    );
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error in /api/users/all:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API search users for login suggestions
app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, users: [] });
    }
    
    const [users] = await pool.query(
      'SELECT ten_dang_nhap, vai_tro FROM nguoi_dung WHERE ten_dang_nhap LIKE ? LIMIT 10',
      [`%${q}%`]
    );
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error in /api/users/search:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy danh sách users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT ma_nguoi_dung as id, ten_dang_nhap as name, vai_tro as role, ngay_tao as created_at, trang_thai as status FROM nguoi_dung ORDER BY ngay_tao DESC');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error in /api/admin/users:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API khóa/mở khóa tài khoản (admin)
app.put('/api/admin/users/:id/toggle-lock', async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query('SELECT trang_thai FROM nguoi_dung WHERE ma_nguoi_dung = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }
    const currentStatus = users[0].trang_thai || 'active';
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    await pool.query('UPDATE nguoi_dung SET trang_thai = ? WHERE ma_nguoi_dung = ?', [newStatus, id]);
    res.json({ success: true, message: newStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', status: newStatus });
  } catch (error) {
    console.error('Error toggle lock:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API quản lý sim (admin)
app.post('/api/admin/sims', async (req, res) => {
  try {
    const { sim_number, network, price, category, feng_shui_element, total_nodes, description } = req.body;
    
    await pool.query(
      'INSERT INTO the_sim (so_sim, nha_mang, gia_ban, loai_sim, menh_phong_thuy, diem_nut, trang_thai, mo_ta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sim_number, network, price, category, feng_shui_element, total_nodes, 'Còn hàng', description || null]
    );
    
    res.json({ success: true, message: 'Thêm sim thành công' });
  } catch (error) {
    console.error('Error in /api/admin/sims:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.delete('/api/admin/sims/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM the_sim WHERE ma_sim = ?', [id]);
    res.json({ success: true, message: 'Xóa sim thành công' });
  } catch (error) {
    console.error('Error in /api/admin/sims:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API cập nhật status sim (admin)
app.put('/api/admin/sims/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.query('UPDATE the_sim SET trang_thai = ? WHERE ma_sim = ?', [status, id]);
    res.json({ success: true, message: 'Cập nhật trạng thái sim thành công' });
  } catch (error) {
    console.error('Error in /api/admin/sims/status:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API cập nhật status đơn hàng (admin)
app.put('/api/admin/purchases/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Lấy thông tin đơn hàng
    const [purchases] = await pool.query('SELECT * FROM don_hang WHERE ma_don_hang = ?', [id]);
    if (purchases.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    
    const purchase = purchases[0];
    
    // Cập nhật status đơn hàng và ngày duyệt/hủy
    await pool.query(
      'UPDATE don_hang SET trang_thai = ?, ngay_duyet = NOW() WHERE ma_don_hang = ?', 
      [status, id]
    );
    
    // Nếu duyệt đơn, cập nhật sim thành "Đã bán"
    if (status === 'Đã duyệt') {
      await pool.query('UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?', ['Đã bán', purchase.so_sim]);
    }
    
    // Nếu hủy đơn, trả sim về kho (status = "Còn hàng")
    if (status === 'Đã hủy') {
      await pool.query('UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?', ['Còn hàng', purchase.so_sim]);
    }
    
    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (error) {
    console.error('Error in /api/admin/purchases/status:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API hủy đơn hàng theo số sim (admin)
app.put('/api/admin/purchases/cancel-by-sim', async (req, res) => {
  try {
    const { sim_number } = req.body;
    const [purchases] = await pool.query(
      "SELECT * FROM don_hang WHERE so_sim = ? AND trang_thai IN ('Chờ duyệt', 'Đã duyệt') ORDER BY ngay_mua DESC LIMIT 1",
      [sim_number]
    );
    if (purchases.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng active cho sim này' });
    }
    const purchase = purchases[0];
    await pool.query('UPDATE don_hang SET trang_thai = ?, ngay_duyet = NOW() WHERE ma_don_hang = ?', ['Đã hủy', purchase.ma_don_hang]);
    await pool.query('UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?', ['Còn hàng', sim_number]);
    res.json({ success: true, message: 'Đã hủy đơn hàng và trả sim về kho' });
  } catch (error) {
    console.error('Error cancel by sim:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lưu lịch sử xem phong thủy
app.post('/api/fengshui-history', async (req, res) => {
  try {
    const { user_id, user_name, birth_date, birth_time, gender, calendar_type, element, lucky_numbers } = req.body;
    
    await pool.query(
      'INSERT INTO lich_su_phong_thuy (ma_nguoi_dung, ten_nguoi_dung, ngay_sinh, gio_sinh, gioi_tinh, loai_lich, menh, so_may_man) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_name, birth_date, birth_time, gender, calendar_type, element, lucky_numbers]
    );
    
    res.json({ success: true, message: 'Đã lưu lịch sử xem phong thủy' });
  } catch (error) {
    console.error('Error in /api/fengshui-history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy lịch sử mua sim (admin)
app.get('/api/admin/purchases', async (req, res) => {
  try {
    const [purchases] = await pool.query(
      `SELECT 
        ma_don_hang as id, 
        ma_nguoi_dung as user_id, 
        ten_nguoi_dung as user_name, 
        so_sim as sim_number, 
        nha_mang as network, 
        gia_mua as price, 
        loai_sim as category, 
        ten_khach_hang as customer_name, 
        sdt_khach_hang as customer_phone, 
        dia_chi_khach_hang as customer_address, 
        phuong_thuc_thanh_toan as payment_method, 
        ngay_mua as purchase_date, 
        trang_thai as status, 
        ngay_duyet as approval_date,
        payment_status,
        paid_at,
        transaction_id
      FROM don_hang 
      ORDER BY ngay_mua DESC`
    );
    res.json({ success: true, data: purchases });
  } catch (error) {
    console.error('Error in /api/admin/purchases:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy lịch sử của user cụ thể
app.get('/api/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [purchases] = await pool.query(
      `SELECT 
        ma_don_hang as id, 
        ma_nguoi_dung as user_id, 
        ten_nguoi_dung as user_name, 
        so_sim as sim_number, 
        nha_mang as network, 
        gia_mua as price, 
        loai_sim as category, 
        ten_khach_hang as customer_name, 
        sdt_khach_hang as customer_phone, 
        dia_chi_khach_hang as customer_address, 
        phuong_thuc_thanh_toan as payment_method, 
        ngay_mua as purchase_date, 
        trang_thai as status, 
        ngay_duyet as approval_date,
        payment_status,
        paid_at,
        transaction_id
      FROM don_hang 
      WHERE ma_nguoi_dung = ? 
      ORDER BY ngay_mua DESC`,
      [userId]
    );
    
    const [fengshui] = await pool.query(
      'SELECT ma_lich_su as id, ma_nguoi_dung as user_id, ten_nguoi_dung as user_name, ngay_sinh as birth_date, gio_sinh as birth_time, gioi_tinh as gender, loai_lich as calendar_type, menh as element, so_may_man as lucky_numbers, ngay_xem as view_date FROM lich_su_phong_thuy WHERE ma_nguoi_dung = ? ORDER BY ngay_xem DESC',
      [userId]
    );
    
    const [recommendations] = await pool.query(
      'SELECT ma_lich_su as id, ma_nguoi_dung as user_id, ten_nguoi_dung as user_name, ngay_sinh as birth_date, so_may_man as lucky_numbers, ngan_sach as price_limit, nha_mang_mong_muon as expected_network, muc_dich as purpose, so_ket_qua as result_count, ngay_tim_kiem as search_date FROM lich_su_phan_tich WHERE ma_nguoi_dung = ? ORDER BY ngay_tim_kiem DESC',
      [userId]
    );
    
    res.json({ 
      success: true, 
      data: {
        purchases,
        fengshui,
        recommendations
      }
    });
  } catch (error) {
    console.error('Error in /api/user/:userId/history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy lịch sử xem phong thủy (admin)
app.get('/api/admin/fengshui-history', async (req, res) => {
  try {
    const [history] = await pool.query(
      'SELECT ma_lich_su as id, ma_nguoi_dung as user_id, ten_nguoi_dung as user_name, ngay_sinh as birth_date, gio_sinh as birth_time, gioi_tinh as gender, loai_lich as calendar_type, menh as element, so_may_man as lucky_numbers, ngay_xem as view_date FROM lich_su_phong_thuy ORDER BY ngay_xem DESC'
    );
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error in /api/admin/fengshui-history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lưu lịch sử phân tích nhu cầu
app.post('/api/recommendation-history', async (req, res) => {
  try {
    const { user_id, user_name, birth_date, lucky_numbers, price_limit, expected_network, purpose, result_count } = req.body;
    
    await pool.query(
      'INSERT INTO lich_su_phan_tich (ma_nguoi_dung, ten_nguoi_dung, ngay_sinh, so_may_man, ngan_sach, nha_mang_mong_muon, muc_dich, so_ket_qua) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_name, birth_date, lucky_numbers, price_limit, expected_network, purpose, result_count]
    );
    
    res.json({ success: true, message: 'Đã lưu lịch sử phân tích' });
  } catch (error) {
    console.error('Error in /api/recommendation-history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy lịch sử phân tích nhu cầu (admin)
app.get('/api/admin/recommendation-history', async (req, res) => {
  try {
    const [history] = await pool.query(
      'SELECT ma_lich_su as id, ma_nguoi_dung as user_id, ten_nguoi_dung as user_name, ngay_sinh as birth_date, so_may_man as lucky_numbers, ngan_sach as price_limit, nha_mang_mong_muon as expected_network, muc_dich as purpose, so_ket_qua as result_count, ngay_tim_kiem as search_date FROM lich_su_phan_tich ORDER BY ngay_tim_kiem DESC'
    );
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error in /api/admin/recommendation-history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lưu tin nhắn liên hệ
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    
    await pool.query(
      'INSERT INTO tin_nhan (ten_nguoi_gui, sdt_nguoi_gui, email_nguoi_gui, noi_dung) VALUES (?, ?, ?, ?)',
      [name, phone, email || null, message]
    );
    
    res.json({ success: true, message: 'Đã gửi tin nhắn thành công' });
  } catch (error) {
    console.error('Error in /api/contact:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy danh sách tin nhắn (admin)
app.get('/api/admin/messages', async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT ma_tin_nhan as id, ten_nguoi_gui as name, sdt_nguoi_gui as phone, email_nguoi_gui as email, noi_dung as message, trang_thai as status, ngay_gui as created_at FROM tin_nhan ORDER BY ngay_gui DESC'
    );
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error in /api/admin/messages:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API đánh dấu tin nhắn đã đọc
app.put('/api/admin/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.query('UPDATE tin_nhan SET trang_thai = ? WHERE ma_tin_nhan = ?', [status, id]);
    res.json({ success: true, message: 'Đã cập nhật trạng thái' });
  } catch (error) {
    console.error('Error in /api/admin/messages:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ==================== WEBHOOK API ====================

// API webhook nhận thông báo từ ngân hàng (Vietcombank, VietQR, etc.)
app.post('/api/webhook/bank-transfer', async (req, res) => {
  const webhookTime = new Date().toLocaleString();
  
  console.log('\n🔔 ===== WEBHOOK RECEIVED ===== 🔔');
  console.log('⏰ Time:', webhookTime);
  console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
  console.log('');
  
  try {
    const {
      transactionId,      // ID giao dịch từ ngân hàng
      amount,             // Số tiền
      description,        // Nội dung chuyển khoản
      accountNumber,      // STK nhận tiền
      transactionDate,    // Ngày giao dịch
      bankCode           // Mã ngân hàng
    } = req.body;

    console.log('🔍 Parsing webhook data:');
    console.log('   - Transaction ID:', transactionId);
    console.log('   - Amount:', amount);
    console.log('   - Description:', description);
    console.log('   - Account Number:', accountNumber);
    console.log('');

    // Kiểm tra STK có đúng không
    if (accountNumber !== '1025311193') {
      console.log('❌ STK không khớp:', accountNumber, '!== 1025311193');
      return res.status(400).json({ success: false, message: 'Số tài khoản không đúng' });
    }
    console.log('✅ Account number matched');

    // Trích xuất số sim từ nội dung chuyển khoản
    // Ví dụ: "MUA SO 0912341991" hoặc "MUA SO 091 234 1991" hoặc "MUASO0912341991"
    console.log('🔍 Extracting sim number from description:', description);
    const simMatch = description?.match(/MUA\s*SO[:\s]*(\d{10}|\d{3}\s*\d{3}\s*\d{4})/i);
    
    if (!simMatch) {
      console.log('❌ Không tìm thấy số sim trong nội dung:', description);
      console.log('   Pattern expected: "MUA SO 0912341991" hoặc "MUASO0912341991"');
      return res.status(400).json({ success: false, message: 'Không tìm thấy số sim trong nội dung chuyển khoản' });
    }

    const simNumber = simMatch[1].replace(/\s/g, ''); // Loại bỏ khoảng trắng
    console.log('✅ Sim number extracted:', simNumber);
    console.log('');

    // Tìm đơn hàng chờ duyệt
    console.log('🔍 Searching for order with:');
    console.log('   - Sim:', simNumber);
    console.log('   - Status: Chờ duyệt');
    console.log('   - Payment method: bank_transfer');
    
    const [orders] = await pool.query(
      `SELECT * FROM don_hang 
       WHERE so_sim = ? 
       AND trang_thai = 'Chờ duyệt' 
       AND phuong_thuc_thanh_toan = 'bank_transfer'
       ORDER BY ngay_mua DESC 
       LIMIT 1`,
      [simNumber]
    );

    console.log('📊 Orders found:', orders.length);

    if (orders.length === 0) {
      console.log('❌ Không tìm thấy đơn hàng chờ duyệt cho sim:', simNumber);
      
      // Debug: Tìm tất cả đơn với sim này
      const [allOrders] = await pool.query(
        'SELECT ma_don_hang, trang_thai, payment_status, phuong_thuc_thanh_toan FROM don_hang WHERE so_sim = ?',
        [simNumber]
      );
      console.log('🔍 All orders for this sim:', allOrders);
      
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const order = orders[0];
    console.log('✅ Order found:');
    console.log('   - Order ID:', order.ma_don_hang);
    console.log('   - Sim:', order.so_sim);
    console.log('   - Price:', order.gia_mua, 'VNĐ');
    console.log('   - Status:', order.trang_thai);
    console.log('   - Payment status:', order.payment_status);
    console.log('');

    // Kiểm tra số tiền có khớp không (cho phép sai số 1000đ)
    const priceDiff = Math.abs(amount - order.gia_mua);
    console.log('💰 Checking amount:');
    console.log('   - Received:', amount, 'VNĐ');
    console.log('   - Expected:', order.gia_mua, 'VNĐ');
    console.log('   - Difference:', priceDiff, 'VNĐ');
    
    if (priceDiff > 1000) {
      console.log('❌ Số tiền không khớp (sai số > 1000đ)');
      return res.status(400).json({ 
        success: false, 
        message: `Số tiền không khớp. Cần ${order.gia_mua}đ, nhận ${amount}đ` 
      });
    }
    console.log('✅ Amount matched (difference <= 1000đ)');
    console.log('');

    // Cập nhật trạng thái đơn hàng thành "Đã duyệt" và payment_status thành "PAID"
    console.log('🔄 Updating order to PAID...');
    console.log('   UPDATE don_hang SET:');
    console.log('   - trang_thai = "Đã duyệt"');
    console.log('   - payment_status = "PAID"');
    console.log('   - paid_at = NOW()');
    console.log('   - transaction_id =', transactionId);
    console.log('   WHERE ma_don_hang =', order.ma_don_hang);
    
    const [updateResult] = await pool.query(
      `UPDATE don_hang 
       SET trang_thai = 'Đã duyệt', 
           payment_status = 'PAID',
           paid_at = NOW(),
           transaction_id = ?,
           ngay_duyet = NOW(),
           ghi_chu = CONCAT(IFNULL(ghi_chu, ''), '\nGiao dịch tự động xác nhận. Mã GD: ', ?)
       WHERE ma_don_hang = ?`,
      [transactionId, transactionId, order.ma_don_hang]
    );

    console.log('✅ UPDATE COMPLETED!');
    console.log('   - Rows affected:', updateResult.affectedRows);
    console.log('');
    
    // CẬP NHẬT SIM THÀNH "ĐÃ BÁN" SAU KHI THANH TOÁN THÀNH CÔNG
    console.log('🔄 Updating sim status to "Đã bán"...');
    const [simUpdateResult] = await pool.query(
      'UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?',
      ['Đã bán', simNumber]
    );
    console.log('✅ Sim status updated to "Đã bán"');
    console.log('   - Rows affected:', simUpdateResult.affectedRows);
    console.log('');
    
    console.log(`🎉 Đã tự động duyệt đơn hàng #${order.ma_don_hang} - Sim: ${simNumber}`);
    console.log('⏰ Frontend polling sẽ phát hiện trong ~3 giây...');
    console.log('===== END WEBHOOK ===== \n');

    // TODO: Gửi thông báo cho khách hàng (SMS/Email)
    // await sendSMS(order.sdt_khach_hang, `Đơn hàng sim ${simNumber} đã được xác nhận thanh toán!`);

    res.json({ 
      success: true, 
      message: 'Đã xác nhận thanh toán và cập nhật đơn hàng',
      orderId: order.ma_don_hang,
      simNumber: simNumber
    });

  } catch (error) {
    console.error('❌ LỖI WEBHOOK:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Lỗi xử lý webhook' });
  }
});

// API test webhook (để test thủ công)
app.post('/api/webhook/test', async (req, res) => {
  try {
    const { simNumber, amount } = req.body;
    
    // Giả lập webhook từ ngân hàng
    const webhookData = {
      transactionId: `TEST${Date.now()}`,
      amount: amount,
      description: `MUA SO ${simNumber}`,
      accountNumber: '1025311193',
      transactionDate: new Date().toISOString(),
      bankCode: 'VCB'
    };

    console.log('🧪 Test webhook:', webhookData);

    // Gọi webhook chính
    const response = await fetch('http://localhost:5000/api/webhook/bank-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();
    res.json({ success: true, testResult: result });

  } catch (error) {
    console.error('❌ Lỗi test webhook:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API kiểm tra trạng thái thanh toán đơn hàng (cho polling)
app.get('/api/order/payment-status/:orderId', async (req, res) => {
  const requestTime = new Date().toLocaleTimeString();
  console.log('\n=== API PAYMENT STATUS CALLED ===');
  console.log('⏰ Time:', requestTime);
  console.log('🆔 Order ID:', req.params.orderId);
  
  try {
    const { orderId } = req.params;
    
    // Check payment consistency FIRST
    const consistencyCheck = await checkPaymentConsistency(orderId);
    
    if (!consistencyCheck.consistent && consistencyCheck.inconsistencies) {
      console.error('🚨 INCONSISTENT STATE DETECTED IN API CALL!');
      console.error('This should be fixed by handlePaymentSuccess()');
    }
    
    console.log('🔍 Querying database for order:', orderId);
    const [orders] = await pool.query(
      'SELECT ma_don_hang, payment_status, paid_at, transaction_id, trang_thai FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );

    if (orders.length === 0) {
      console.log('❌ Order not found:', orderId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    console.log('✅ Order found in database:');
    console.log('   - ma_don_hang:', orders[0].ma_don_hang);
    console.log('   - payment_status:', orders[0].payment_status);
    console.log('   - paid_at:', orders[0].paid_at);
    console.log('   - transaction_id:', orders[0].transaction_id);
    console.log('   - consistency:', consistencyCheck.consistent ? '✅ OK' : '❌ INCONSISTENT');

    const responseData = {
      success: true,
      data: {
        orderId: orders[0].ma_don_hang,
        paymentStatus: orders[0].payment_status,
        paidAt: orders[0].paid_at,
        transactionId: orders[0].transaction_id,
        orderStatus: orders[0].trang_thai
      }
    };
    
    console.log('📤 Returning response:', JSON.stringify(responseData, null, 2));
    console.log('=== END API CALL ===\n');
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy đơn hàng theo số sim và user (cho frontend check)
app.get('/api/order/by-sim/:simNumber', async (req, res) => {
  try {
    const { simNumber } = req.params;
    const { userId } = req.query;
    
    const [orders] = await pool.query(
      `SELECT ma_don_hang, payment_status, paid_at, transaction_id, trang_thai, ngay_mua 
       FROM don_hang 
       WHERE so_sim = ? AND ma_nguoi_dung = ?
       ORDER BY ngay_mua DESC 
       LIMIT 1`,
      [simNumber, userId]
    );

    if (orders.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({
      success: true,
      data: {
        orderId: orders[0].ma_don_hang,
        paymentStatus: orders[0].payment_status,
        paidAt: orders[0].paid_at,
        transactionId: orders[0].transaction_id,
        orderStatus: orders[0].trang_thai,
        orderDate: orders[0].ngay_mua
      }
    });
  } catch (error) {
    console.error('Error getting order by sim:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ==================== PAYOS PAYMENT API ====================

const payosService = require('./services/payosService');
const { handlePaymentSuccess, checkPaymentConsistency } = require('./services/paymentHandler');

// API tạo payment link PayOS
app.post('/api/payment/create', async (req, res) => {
  console.log('\n🔷 === POST /api/payment/create ===');
  console.log('📥 Request body:', req.body);
  
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    
    // Load order from database
    console.log('🔍 Loading order:', orderId);
    const [orders] = await pool.query(
      'SELECT * FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = orders[0];
    console.log('✅ Order loaded:', order.so_sim, '-', order.gia_mua, 'VNĐ');
    
    // Check if already PAID
    if (order.payment_status === 'PAID') {
      console.log('⚠️ Order already paid');
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }
    
    // Create PayOS payment link
    const paymentLink = await payosService.createPaymentLink({
      orderId: order.ma_don_hang,
      orderCode: order.ma_don_hang,
      amount: order.gia_mua,
      description: `Mua sim ${order.so_sim}`,
      buyerName: order.ten_khach_hang,
      buyerPhone: order.sdt_khach_hang
    });
    
    // Save payment link ID to database
    console.log('💾 Saving paymentLinkId to database...');
    await pool.query(
      'UPDATE don_hang SET transaction_id = ? WHERE ma_don_hang = ?',
      [paymentLink.paymentLinkId, orderId]
    );
    console.log('✅ PaymentLinkId saved');
    
    console.log('📤 Returning payment link to frontend');
    console.log('=== END /api/payment/create ===\n');
    
    res.json({
      success: true,
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
      paymentLinkId: paymentLink.paymentLinkId,
      orderCode: paymentLink.orderCode
    });
    
  } catch (error) {
    console.error('❌ Error creating payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment link',
      error: error.message 
    });
  }
});

// ==================== PAYOS WEBHOOK ====================

app.post('/api/payos/webhook', async (req, res) => {
  console.log('\n🔔 === PAYOS WEBHOOK RECEIVED ===');
  console.log('📥 Webhook data:', JSON.stringify(req.body, null, 2));
  
  try {
    const webhookData = req.body;
    
    // Check if this is a test webhook (for local testing without signature)
    const isTestWebhook = webhookData.data?.reference?.startsWith('TEST_');
    
    let verifiedData;
    
    if (isTestWebhook) {
      console.log('⚠️  TEST MODE: Skipping signature verification');
      verifiedData = webhookData;
    } else {
      // Verify webhook data for real PayOS webhooks
      console.log('🔐 Verifying webhook signature...');
      try {
        verifiedData = await payosService.verifyWebhookSignature(webhookData);
        console.log('✅ Webhook signature verified');
      } catch (verifyError) {
        console.error('❌ Webhook signature verification failed:', verifyError.message);
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }
    
    console.log('✅ Webhook data accepted:', verifiedData);
    
    // Extract payment data
    const { code, desc, data } = verifiedData;
    
    if (code !== '00') {
      console.log('⚠️ Payment not successful. Code:', code, 'Desc:', desc);
      return res.json({ success: true, message: 'Webhook received but payment not successful' });
    }
    
    const {
      orderCode,
      amount,
      description,
      accountNumber,
      reference,
      transactionDateTime,
      paymentLinkId
    } = data;
    
    console.log('💰 Payment successful:');
    console.log('   - Order Code:', orderCode);
    console.log('   - Amount:', amount);
    console.log('   - Payment Link ID:', paymentLinkId);
    console.log('   - Reference:', reference);
    
    // Use centralized payment handler
    const result = await handlePaymentSuccess(
      orderCode, 
      reference || paymentLinkId,
      {
        source: isTestWebhook ? 'test-webhook' : 'payos-webhook',
        autoApprove: true  // Auto-approve when payment confirmed
      }
    );
    
    if (result.success) {
      console.log('🎉 Payment processed successfully via centralized handler!');
      console.log('⏰ Frontend polling will detect in ~3 seconds');
      console.log('=== END PAYOS WEBHOOK ===\n');
      
      res.json({ 
        success: true, 
        message: result.alreadyPaid ? 'Order already paid' : 'Payment processed',
        data: result.data
      });
    } else {
      console.error('❌ Payment processing failed:', result.message);
      res.status(500).json({ success: false, message: result.message });
    }
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ success: false, message: 'Webhook processing failed', error: error.message });
  }
});

// ==================== SERVER ====================

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
