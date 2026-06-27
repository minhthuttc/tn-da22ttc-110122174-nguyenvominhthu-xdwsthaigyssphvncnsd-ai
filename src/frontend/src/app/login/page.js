"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { LogIn, User, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);

  // Load users when page loads
  useEffect(() => {
    loadAllUsers();
  }, []);

  // Load all users when input is focused
  const loadAllUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/all');
      if (res.data.success) {
        setUserSuggestions(res.data.users);
      }
    } catch (err) {
      // Silently handle error
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounce
    debounceTimer.current = setTimeout(async () => {
      if (value.length >= 2) {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/search?q=${value}`);
          if (res.data.success) {
            setUserSuggestions(res.data.users);
            setShowSuggestions(true);
          }
        } catch (err) {
          // Silently handle error
          setShowSuggestions(false);
        }
      } else if (value.length === 0) {
        setShowSuggestions(false);
      } else {
        setShowSuggestions(false);
      }
    }, 300); // Wait 300ms after user stops typing
  };

  const handleFocus = () => {
    if (userSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const selectUser = (username) => {
    setFormData({ ...formData, name: username });
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/login", formData);

      if (res.data.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Trigger storage event để Header cập nhật
        window.dispatchEvent(new Event("storage"));
        
        // Chuyển hướng dựa trên role
        if (res.data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-dark dark:via-dark-lighter dark:to-dark flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogIn className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Đăng Nhập</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chào mừng bạn quay trở lại
          </p>
        </div>

        <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`px-4 py-3 rounded-lg border ${
                error.includes('khóa') 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}>
                <div className="flex items-start gap-2">
                  {error.includes('khóa') && <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />}
                  <div>
                    <p className="font-semibold">{error}</p>
                    {error.includes('khóa') && (
                      <p className="text-sm mt-1 opacity-80">Vui lòng liên hệ người quản trị qua trang Liên hệ để được hỗ trợ mở khóa.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                <User className="w-4 h-4" />
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                onFocus={handleFocus}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                required
                autoComplete="off"
                className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                placeholder="Nhập tên đăng nhập"
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && userSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-lighter border-2 border-primary rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {userSuggestions.map((user, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectUser(user.ten_dang_nhap)}
                      className="w-full text-left px-4 py-3 hover:bg-primary/10 dark:hover:bg-primary/20 transition flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold dark:text-white">{user.ten_dang_nhap}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.vai_tro === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                <Lock className="w-4 h-4" />
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-primary/30 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Đăng ký ngay
              </Link>
            </p>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tài khoản admin demo:<br />
                <span className="font-mono">Admin / admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
