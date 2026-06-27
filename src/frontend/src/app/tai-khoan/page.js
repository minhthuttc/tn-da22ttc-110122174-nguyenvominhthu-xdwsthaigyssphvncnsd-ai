"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { User, ShoppingCart, Sparkles, Search, Calendar, Phone, MapPin, CreditCard, Package } from "lucide-react";

export default function TaiKhoanPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [fengshuiHistory, setFengshuiHistory] = useState([]);
  const [recommendationHistory, setRecommendationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("purchases");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchUserHistory(parsedUser.id);
  }, []);

  const fetchUserHistory = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/user/${userId}/history`);
      
      if (response.data.success) {
        setPurchases(response.data.data.purchases);
        setFengshuiHistory(response.data.data.fengshui);
        setRecommendationHistory(response.data.data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching user history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile */}
        <div className="bg-gradient-to-r from-primary to-amber-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Xin chào, {user.name}!</h1>
              <p className="opacity-90">Tài khoản của bạn</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-lighter rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Đơn hàng</p>
                <p className="text-3xl font-bold text-primary mt-2">{purchases.length}</p>
              </div>
              <div className="bg-primary/10 rounded-full p-3">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-lighter rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Xem phong thủy</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{fengshuiHistory.length}</p>
              </div>
              <div className="bg-amber-100 rounded-full p-3">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-lighter rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Tìm kiếm AI</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{recommendationHistory.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "purchases"
                ? "bg-primary text-white shadow-lg"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Đơn hàng của tôi ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab("fengshui")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "fengshui"
                ? "bg-primary text-white shadow-lg"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Lịch sử phong thủy ({fengshuiHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "recommendations"
                ? "bg-primary text-white shadow-lg"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Search className="w-5 h-5" />
            Lịch sử tìm kiếm ({recommendationHistory.length})
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-dark-lighter rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Đơn hàng */}
          {activeTab === "purchases" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                Đơn hàng của tôi
              </h2>
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng: #{purchase.id}</p>
                          <p className="text-2xl font-bold text-primary mt-1">{purchase.sim_number}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            purchase.status === 'Đã duyệt' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : purchase.status === 'Đã hủy'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {purchase.status || 'Chờ duyệt'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            purchase.payment_status === 'PAID' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : purchase.payment_status === 'FAILED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {purchase.payment_status === 'PAID' ? '✓ Đã thanh toán' : purchase.payment_status === 'FAILED' ? '✗ Thất bại' : '⏳ Chờ thanh toán'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Nhà mạng</p>
                          <p className="font-semibold dark:text-white">{purchase.network}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Giá</p>
                          <p className="font-bold text-primary text-lg">{Number(purchase.price).toLocaleString('vi-VN')} đ</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h4 className="font-semibold dark:text-white mb-2">Thông tin người nhận</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="dark:text-gray-300">{purchase.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="dark:text-gray-300">{purchase.customer_phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="dark:text-gray-300">{purchase.customer_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="dark:text-gray-300">{purchase.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'COD'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Ngày đặt: {new Date(purchase.purchase_date).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Bạn chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
          )}

          {/* Lịch sử phong thủy */}
          {activeTab === "fengshui" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-600" />
                Lịch sử xem phong thủy
              </h2>
              {fengshuiHistory.length > 0 ? (
                <div className="space-y-4">
                  {fengshuiHistory.map((history) => (
                    <div key={history.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-4 py-2 bg-amber-600 text-white rounded-full font-bold text-lg">
                              Mệnh {history.element}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {history.calendar_type === 'solar' ? 'Dương lịch' : 'Âm lịch'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh</p>
                              <p className="font-semibold dark:text-white">{new Date(history.birth_date).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Giờ sinh</p>
                              <p className="font-semibold dark:text-white">{history.birth_time || 'Không có'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Giới tính</p>
                              <p className="font-semibold dark:text-white">{history.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Số may mắn</p>
                            <p className="text-xl font-bold text-amber-600 mt-1">{history.lucky_numbers}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(history.view_date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Bạn chưa xem phong thủy</p>
                </div>
              )}
            </div>
          )}

          {/* Lịch sử tìm kiếm AI */}
          {activeTab === "recommendations" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
                <Search className="w-6 h-6 text-blue-600" />
                Lịch sử phân tích nhu cầu AI
              </h2>
              {recommendationHistory.length > 0 ? (
                <div className="space-y-4">
                  {recommendationHistory.map((history) => (
                    <div key={history.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg dark:text-white mb-2">{history.purpose || 'Tìm sim phù hợp'}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Ngân sách</p>
                              <p className="font-semibold text-primary">
                                {history.price_limit ? Number(history.price_limit).toLocaleString('vi-VN') + ' đ' : 'Không giới hạn'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Nhà mạng</p>
                              <p className="font-semibold dark:text-white">{history.expected_network || 'Tất cả'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Kết quả</p>
                              <p className="font-semibold text-green-600">{history.result_count} sim phù hợp</p>
                            </div>
                          </div>

                          {history.lucky_numbers && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Số yêu thích</p>
                              <p className="font-bold text-blue-600 dark:text-blue-400">{history.lucky_numbers}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(history.search_date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Bạn chưa có lịch sử tìm kiếm</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
