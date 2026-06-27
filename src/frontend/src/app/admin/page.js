"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Users, Package, Trash2, Plus, ShoppingCart, Sparkles, Search, MessageSquare, BarChart3, Lock, Unlock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [sims, setSims] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [fengshuiHistory, setFengshuiHistory] = useState([]);
  const [recommendationHistory, setRecommendationHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchStats, setSearchStats] = useState([]);
  const [activeTab, setActiveTab] = useState("sims");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState({
    purchases: [],
    fengshui: [],
    recommendations: []
  });
  const [newSim, setNewSim] = useState({
    sim_number: "",
    network: "Viettel",
    price: "",
    category: "Sim số đẹp",
    feng_shui_element: "Kim",
    total_nodes: 5,
    description: ""
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/");
      return;
    }

    setUser(parsedUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, simsRes, purchasesRes, fengshuiRes, recommendationRes, messagesRes, searchStatsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users"),
        axios.get("http://localhost:5000/api/sims"),
        axios.get("http://localhost:5000/api/admin/purchases"),
        axios.get("http://localhost:5000/api/admin/fengshui-history"),
        axios.get("http://localhost:5000/api/admin/recommendation-history"),
        axios.get("http://localhost:5000/api/admin/messages"),
        axios.get("http://localhost:5000/api/admin/sim-search-stats")
      ]);

      setUsers(usersRes.data.data);
      setSims(simsRes.data.data);
      setPurchases(purchasesRes.data.data);
      setFengshuiHistory(fengshuiRes.data.data);
      setRecommendationHistory(recommendationRes.data.data);
      setMessages(messagesRes.data.data);
      setSearchStats(searchStatsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddSim = async (e) => {
    e.preventDefault();
    
    // Validation giá
    const price = parseInt(newSim.price);
    if (price < 1000) {
      alert("❌ Giá sim phải từ 1,000đ trở lên!");
      return;
    }
    if (price > 5000000) {
      alert("❌ Giá sim không được vượt quá 5,000,000đ!");
      return;
    }
    
    try {
      const simData = {
        sim_number: newSim.sim_number,
        network: newSim.network,
        price: price,
        category: newSim.category,
        feng_shui_element: newSim.feng_shui_element,
        total_nodes: parseInt(newSim.total_nodes),
        description: newSim.description || null
      };
      
      await axios.post("http://localhost:5000/api/admin/sims", simData);
      alert("✅ Thêm sim thành công vào kho!");
      setShowAddForm(false);
      setNewSim({
        sim_number: "",
        network: "Viettel",
        price: "",
        category: "Sim số đẹp",
        feng_shui_element: "Kim",
        total_nodes: 5,
        description: ""
      });
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi thêm sim";
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleDeleteSim = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sim này?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/sims/${id}`);
      alert("Xóa sim thành công!");
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa sim");
    }
  };

  const handleViewUserHistory = async (userId, userName) => {
    try {
      // Lấy lịch sử của user cụ thể
      const userPurchases = purchases.filter(p => p.user_id === userId);
      const userFengshui = fengshuiHistory.filter(f => f.user_id === userId);
      const userRecommendations = recommendationHistory.filter(r => r.user_id === userId);
      
      setUserHistory({
        purchases: userPurchases,
        fengshui: userFengshui,
        recommendations: userRecommendations
      });
      
      setSelectedUser({ id: userId, name: userName });
    } catch (error) {
      console.error("Error fetching user history:", error);
      alert("Lỗi khi tải lịch sử người dùng");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {/* Header */}
      <div className="bg-white dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
            <span className="text-gray-600 dark:text-gray-400">
              Xin chào, <span className="font-semibold">{user.name}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("sims")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "sims"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Package className="w-5 h-5" />
            Quản lý Sim ({sims.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "users"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Users className="w-5 h-5" />
            Quản lý User ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "purchases"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Lịch sử mua sim ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab("fengshui")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "fengshui"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Lịch sử phong thủy ({fengshuiHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "recommendations"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Search className="w-5 h-5" />
            Lịch sử phân tích ({recommendationHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "messages"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Tin nhắn liên hệ ({messages.filter(m => m.status === 'Chưa đọc').length})
          </button>

        </div>

        {/* Content */}
        {activeTab === "sims" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">Danh sách Sim</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Thêm Sim
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white dark:bg-dark-lighter rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-bold mb-4 dark:text-white">📱 Thêm Sim Mới Vào Kho</h3>
                <form onSubmit={handleAddSim} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Số sim */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Số sim *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 0912341991"
                      value={newSim.sim_number}
                      onChange={(e) => setNewSim({...newSim, sim_number: e.target.value})}
                      required
                      pattern="\d{10}"
                      maxLength="10"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nhập đúng 10 chữ số</p>
                  </div>

                  {/* Nhà mạng */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Nhà mạng *</label>
                    <select
                      value={newSim.network}
                      onChange={(e) => setNewSim({...newSim, network: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary"
                    >
                      <option>Viettel</option>
                      <option>Vinaphone</option>
                      <option>Mobifone</option>
                    </select>
                  </div>

                  {/* Giá */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">
                      Giá bán (VNĐ) *
                      <span className="text-xs text-gray-500 font-normal ml-2">Từ 1k → 5 triệu</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Ví dụ: 500000"
                      value={newSim.price}
                      onChange={(e) => setNewSim({...newSim, price: e.target.value})}
                      required
                      min="1000"
                      max="5000000"
                      step="1000"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💰 Giá trị phải từ 1,000đ đến 5,000,000đ
                    </p>
                  </div>

                  {/* Loại sim */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Loại sim *</label>
                    <select
                      value={newSim.category}
                      onChange={(e) => setNewSim({...newSim, category: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary"
                    >
                      <option value="Sim số đẹp">Sim số đẹp</option>
                      <option value="Sim tam hoa">Sim tam hoa</option>
                      <option value="Sim tứ quý">Sim tứ quý</option>
                      <option value="Sim thần tài">Sim thần tài</option>
                      <option value="Sim lộc phát">Sim lộc phát</option>
                      <option value="Sim năm sinh">Sim năm sinh</option>
                      <option value="Sim dễ nhớ">Sim dễ nhớ</option>
                      <option value="Sim ngày sinh">Sim ngày sinh</option>
                    </select>
                  </div>

                  {/* Mệnh phong thủy */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Mệnh phong thủy *</label>
                    <select
                      value={newSim.feng_shui_element}
                      onChange={(e) => setNewSim({...newSim, feng_shui_element: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary"
                    >
                      <option value="Kim">🟡 Mệnh Kim</option>
                      <option value="Mộc">🟢 Mệnh Mộc</option>
                      <option value="Thủy">🔵 Mệnh Thủy</option>
                      <option value="Hỏa">🔴 Mệnh Hỏa</option>
                      <option value="Thổ">🟤 Mệnh Thổ</option>
                    </select>
                  </div>

                  {/* Điểm nút */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">
                      Điểm nút phong thủy (1-10) * 
                      <span className="text-xs text-gray-500 font-normal ml-2">Đánh giá chất lượng sim</span>
                    </label>
                    <input
                      type="range"
                      value={newSim.total_nodes}
                      onChange={(e) => setNewSim({...newSim, total_nodes: e.target.value})}
                      min="1"
                      max="10"
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>1 (Kém)</span>
                      <span className="text-lg font-bold text-primary">{newSim.total_nodes}/10</span>
                      <span>10 (Tuyệt vời)</span>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        <strong>💡 Điểm nút phong thủy</strong> là thước đo chất lượng sim dựa trên các yếu tố:
                      </p>
                      <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1 ml-4 list-disc">
                        <li><strong>Độ đẹp số:</strong> Số lặp (999, 888), số tiến (123, 456), đối xứng</li>
                        <li><strong>Ý nghĩa:</strong> Số may mắn (6, 8, 9), tránh số xấu (4)</li>
                        <li><strong>Hợp phong thủy:</strong> Phù hợp với mệnh ngũ hành</li>
                        <li><strong>Độ hiếm:</strong> Sim độc, khó tìm</li>
                      </ul>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                        <strong>Gợi ý:</strong> 1-3 (Sim thường), 4-6 (Sim khá), 7-8 (Sim đẹp), 9-10 (Sim VIP)
                      </p>
                    </div>
                  </div>

                  {/* Chi tiết về sim */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 dark:text-gray-300">
                      Chi tiết về sim (tùy chọn)
                      <span className="text-xs text-gray-500 font-normal ml-2">Mô tả đặc điểm, ý nghĩa của sim</span>
                    </label>
                    <textarea
                      value={newSim.description}
                      onChange={(e) => setNewSim({...newSim, description: e.target.value})}
                      placeholder="Ví dụ: Sim tam hoa đuôi 999, mang ý nghĩa trường tồn vĩnh cửu. Phù hợp với người mệnh Kim, hỗ trợ tài lộc và sự nghiệp phát triển..."
                      rows="4"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      📝 Viết mô tả chi tiết về sim để khách hàng hiểu rõ hơn về giá trị và ý nghĩa
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="md:col-span-2 flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewSim({
                          sim_number: "",
                          network: "Viettel",
                          price: "",
                          category: "Sim số đẹp",
                          feng_shui_element: "Kim",
                          total_nodes: 5,
                          description: ""
                        });
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm Sim Vào Kho
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Thống kê tổng quát */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Biểu đồ theo nhà mạng */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  Sim theo nhà mạng
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={(() => {
                    const counts = {};
                    sims.forEach(s => { counts[s.network] = (counts[s.network] || 0) + 1; });
                    return Object.entries(counts).map(([name, value]) => ({ name, value }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#ea580c" fontWeight="600" />
                    <YAxis allowDecimals={false} stroke="#ea580c" />
                    <Tooltip 
                      formatter={(value) => [`${value} sim`, 'Số lượng']}
                      contentStyle={{
                        backgroundColor: '#fff7ed',
                        border: '2px solid #fb923c',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="value" fill="url(#orangeGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Biểu đồ theo mệnh */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Sim theo mệnh
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={(() => {
                    const counts = {};
                    sims.forEach(s => { counts[s.feng_shui_element] = (counts[s.feng_shui_element] || 0) + 1; });
                    return Object.entries(counts).map(([name, value]) => ({ name, value }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#059669" fontWeight="600" />
                    <YAxis allowDecimals={false} stroke="#059669" />
                    <Tooltip 
                      formatter={(value) => [`${value} sim`, 'Số lượng']}
                      contentStyle={{
                        backgroundColor: '#ecfdf5',
                        border: '2px solid #34d399',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="value" fill="url(#greenGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Biểu đồ sim được xem nhiều nhất */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-800 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-rose-600" />
                  Sim được xem nhiều nhất (Top 20)
                </h3>
                {searchStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={searchStats.slice(0, 20)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f43f5e" opacity={0.2} />
                      <XAxis 
                        dataKey="sim_number" 
                        tick={{ fontSize: 9 }} 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                        interval={0}
                        stroke="#e11d48"
                        fontWeight="600"
                      />
                      <YAxis allowDecimals={false} stroke="#e11d48" />
                      <Tooltip 
                        formatter={(value) => [`${value} lượt`, 'Số lần xem']}
                        labelFormatter={(label) => `Sim: ${label}`}
                        contentStyle={{
                          backgroundColor: '#fff1f2',
                          border: '2px solid #fb7185',
                          borderRadius: '8px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Bar dataKey="search_count" fill="url(#redGradient)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                          <stop offset="100%" stopColor="#fb7185" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                    <BarChart3 className="w-12 h-12 mb-3 opacity-40" />
                    <p>Chưa có lượt xem</p>
                    <p className="text-sm">Khi khách hàng xem chi tiết sim sẽ có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số Sim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nhà mạng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mệnh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Điểm nút</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Lượt xem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sims.map((sim) => (
                    <tr key={sim.ma_sim || sim.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">{sim.sim_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{sim.network}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{Number(sim.price).toLocaleString('vi-VN')} đ</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-400 rounded-full font-semibold text-sm">
                          {sim.feng_shui_element}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">
                          {sim.total_nodes}/10
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-semibold text-sm">
                          {sim.search_count || 0} lượt
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSim(sim.ma_sim || sim.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Danh sách User</h2>
            <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
              <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ transform: 'rotateX(180deg)' }}>
                <table className="w-full" style={{ minWidth: '800px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr 
                      key={u.id}
                      onClick={() => handleViewUserHistory(u.id, u.name)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{u.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Hoạt động
                          </span>
                        ) : (
                          <button
                            onClick={async () => {
                              const action = u.status === 'locked' ? 'mở khóa' : 'khóa';
                              if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${u.name}"?`)) return;
                              try {
                                await axios.put(`http://localhost:5000/api/admin/users/${u.id}/toggle-lock`);
                                alert(`Đã ${action} tài khoản "${u.name}"`);
                                fetchData();
                              } catch (error) {
                                alert('Có lỗi xảy ra!');
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 hover:shadow-md border ${
                              u.status === 'locked'
                                ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50'
                                : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50'
                            }`}
                            title={u.status === 'locked' ? 'Bấm để mở khóa' : 'Bấm để khóa tài khoản'}
                          >
                            {u.status === 'locked' ? (
                              <>
                                <Lock className="w-3 h-3" />
                                Đã khóa
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                Hoạt động
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "purchases" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Lịch sử mua Sim</h2>
            {/* Container với thanh lướt ngang và dọc */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto bg-white dark:bg-dark-lighter rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full" style={{ minWidth: '1400px' }}>
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tài khoản</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số Sim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nhà mạng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giá</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên KH</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SĐT KH</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PT Thanh toán</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày mua</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{purchase.user_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">{purchase.sim_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{purchase.network}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{Number(purchase.price).toLocaleString('vi-VN')} đ</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{purchase.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{purchase.customer_phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          purchase.payment_method === 'bank_transfer' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {purchase.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'COD'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {/* Hiển thị trạng thái tổng hợp */}
                          {(() => {
                            // Nếu có transaction_id => Đã chuyển khoản thành công
                            if (purchase.transaction_id && purchase.payment_method === 'bank_transfer') {
                              return (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Đã chuyển khoản - {purchase.status || 'Chờ duyệt'}
                                </span>
                              );
                            }
                            // Nếu thanh toán thất bại
                            if (purchase.payment_status === 'FAILED') {
                              return (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                  Thanh toán thất bại
                                </span>
                              );
                            }
                            // Nếu đã hủy
                            if (purchase.status === 'Đã hủy') {
                              return (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                  Đã hủy
                                </span>
                              );
                            }
                            // Nếu đã duyệt
                            if (purchase.status === 'Đã duyệt') {
                              // COD đã duyệt
                              if (purchase.payment_method === 'cod') {
                                return (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Đã duyệt - Chưa thanh toán
                                  </span>
                                );
                              }
                              return (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Đã duyệt
                                </span>
                              );
                            }
                            // Mặc định: Chờ duyệt
                            if (purchase.payment_method === 'cod') {
                              return (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  Chưa thanh toán - Chờ duyệt
                                </span>
                              );
                            }
                            // Chuyển khoản chưa thanh toán
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Chờ chuyển khoản
                              </span>
                            );
                          })()}
                          {purchase.transaction_id && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              GD: {purchase.transaction_id.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white text-sm">
                        {new Date(purchase.purchase_date).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {purchase.status === 'Chờ duyệt' && (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (!confirm(`Duyệt đơn hàng sim ${purchase.sim_number}?`)) return;
                                try {
                                  await axios.put(`http://localhost:5000/api/admin/purchases/${purchase.id}/status`, {
                                    status: 'Đã duyệt'
                                  });
                                  alert('Đã duyệt đơn hàng!');
                                  fetchData();
                                } catch (error) {
                                  alert('Có lỗi xảy ra!');
                                }
                              }}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Hủy đơn hàng sim ${purchase.sim_number}? Sim sẽ được trả về kho.`)) return;
                                try {
                                  await axios.put(`http://localhost:5000/api/admin/purchases/${purchase.id}/status`, {
                                    status: 'Đã hủy'
                                  });
                                  alert('Đã hủy đơn hàng và trả sim về kho!');
                                  fetchData();
                                } catch (error) {
                                  alert('Có lỗi xảy ra!');
                                }
                              }}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                        {purchase.status === 'Đã duyệt' && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Hủy đơn hàng đã duyệt sim ${purchase.sim_number}? Sim sẽ được trả về kho.`)) return;
                              try {
                                await axios.put(`http://localhost:5000/api/admin/purchases/${purchase.id}/status`, {
                                  status: 'Đã hủy'
                                });
                                alert('Đã hủy đơn hàng và trả sim về kho!');
                                fetchData();
                              } catch (error) {
                                alert('Có lỗi xảy ra!');
                              }
                            }}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                          >
                            Hủy đơn
                          </button>
                        )}
                        {purchase.status === 'Đã hủy' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">Đã hủy</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {purchases.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có lịch sử mua sim
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "fengshui" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Lịch sử xem Phong Thủy</h2>
            <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
              <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ transform: 'rotateX(180deg)' }}>
                <table className="w-full" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Người xem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày sinh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giờ sinh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giới tính</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loại lịch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mệnh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số may mắn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {fengshuiHistory.map((history) => (
                    <tr key={history.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{history.user_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(history.birth_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{history.birth_time || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.gender === 'male' ? 'Nam' : 'Nữ'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.calendar_type === 'solar' ? 'Dương lịch' : 'Âm lịch'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                          {history.element}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">{history.lucky_numbers}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(history.view_date).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fengshuiHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có lịch sử xem phong thủy
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Lịch sử phân tích nhu cầu AI</h2>
            <div className="overflow-x-auto overflow-y-visible" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 inline-block min-w-full">
                <table className="w-full" style={{ minWidth: '1400px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày sinh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số yêu thích</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngân sách</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nhà mạng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mục đích</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kết quả</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày tìm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recommendationHistory.map((history) => (
                    <tr key={history.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{history.user_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.birth_date ? new Date(history.birth_date).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">
                        {history.lucky_numbers || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.price_limit ? Number(history.price_limit).toLocaleString('vi-VN') + ' đ' : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.expected_network || 'Tất cả'}
                      </td>
                      <td className="px-6 py-4 dark:text-white" style={{ minWidth: '250px', maxWidth: '250px' }}>
                        <div className="truncate" title={history.purpose}>
                          {history.purpose || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                          {history.result_count} sim
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(history.search_date).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recommendationHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có lịch sử phân tích nhu cầu
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Tin nhắn liên hệ từ khách hàng</h2>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`bg-white dark:bg-dark-lighter rounded-xl p-6 border-2 ${
                    msg.status === 'Chưa đọc' 
                      ? 'border-primary shadow-lg' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold dark:text-white">{msg.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>📞 {msg.phone}</span>
                        {msg.email && <span>✉️ {msg.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        msg.status === 'Chưa đọc'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {msg.status}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            const newStatus = msg.status === 'Chưa đọc' ? 'Đã đọc' : 'Chưa đọc';
                            await axios.put(`http://localhost:5000/api/admin/messages/${msg.id}`, {
                              status: newStatus
                            });
                            fetchData();
                          } catch (error) {
                            console.error('Error updating message:', error);
                            alert('Có lỗi khi cập nhật trạng thái');
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          msg.status === 'Chưa đọc'
                            ? 'bg-primary hover:bg-primary-hover text-white'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {msg.status === 'Chưa đọc' ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(msg.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Chưa có tin nhắn liên hệ nào
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal lịch sử người dùng */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-dark-lighter rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Lịch sử hoạt động</h2>
                <p className="text-sm opacity-90">Người dùng: {selectedUser.name}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Đơn hàng */}
              <div className="mb-8">
                <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Đơn hàng ({userHistory.purchases.length})
                </h3>
                {userHistory.purchases.length > 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Số Sim</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Giá</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Trạng thái</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Ngày mua</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {userHistory.purchases.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-3 dark:text-white font-mono">{p.sim_number}</td>
                            <td className="px-4 py-3 dark:text-white">{Number(p.price).toLocaleString('vi-VN')} đ</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                p.status === 'Đã duyệt' 
                                  ? 'bg-green-100 text-green-800' 
                                  : p.status === 'Đã hủy'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {p.status || 'Chờ duyệt'}
                              </span>
                            </td>
                            <td className="px-4 py-3 dark:text-white text-sm">
                              {new Date(p.purchase_date).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Chưa có đơn hàng nào</p>
                )}
              </div>

              {/* Lịch sử phong thủy */}
              <div className="mb-8">
                <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Lịch sử xem phong thủy ({userHistory.fengshui.length})
                </h3>
                {userHistory.fengshui.length > 0 ? (
                  <div className="grid gap-3">
                    {userHistory.fengshui.map((f) => (
                      <div key={f.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="dark:text-white"><strong>Mệnh:</strong> <span className="text-primary font-semibold">{f.element}</span></p>
                            <p className="dark:text-white text-sm"><strong>Số may mắn:</strong> {f.lucky_numbers}</p>
                            <p className="dark:text-white text-sm"><strong>Giới tính:</strong> {f.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(f.view_date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Chưa xem phong thủy</p>
                )}
              </div>

              {/* Lịch sử phân tích AI */}
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Lịch sử phân tích AI ({userHistory.recommendations.length})
                </h3>
                {userHistory.recommendations.length > 0 ? (
                  <div className="grid gap-3">
                    {userHistory.recommendations.map((r) => (
                      <div key={r.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="dark:text-white"><strong>Mục đích:</strong> {r.purpose || 'Không có'}</p>
                            <div className="flex gap-4 text-sm dark:text-gray-300 mt-1">
                              <span><strong>Ngân sách:</strong> {r.price_limit ? Number(r.price_limit).toLocaleString('vi-VN') + ' đ' : 'Không giới hạn'}</span>
                              <span><strong>Nhà mạng:</strong> {r.expected_network || 'Tất cả'}</span>
                            </div>
                            <p className="text-sm dark:text-gray-300"><strong>Kết quả:</strong> {r.result_count} sim</p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(r.search_date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Chưa có lịch sử phân tích</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
