"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { UserPlus, Lock, User, Eye, EyeOff, Calendar, Phone, MapPin } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    phone: "",
    address: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);

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

  const handleFocus = async () => {
    // Only load users when focused, don't show error if fails
    if (formData.name.length === 0) {
      try {
        const res = await axios.get('http://localhost:5000/api/users/all');
        if (res.data.success && res.data.users.length > 0) {
          setUserSuggestions(res.data.users);
          setShowSuggestions(true);
        }
      } catch (err) {
        // Silently handle error
        setShowSuggestions(false);
      }
    } else if (formData.name.length >= 2 && userSuggestions.length > 0) {
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

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        name: formData.name,
        password: formData.password,
        birthDate: formData.birthDate || null,
        phone: formData.phone || null,
        address: formData.address || null
      });

      if (res.data.success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        router.push("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-dark dark:via-dark-lighter dark:to-dark flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <UserPlus className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Đăng Ký Tài Khoản</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tạo tài khoản để trải nghiệm đầy đủ dịch vụ
          </p>
        </div>

        <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
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
                <Calendar className="w-4 h-4" />
                Ngày sinh (tùy chọn)
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Giúp tự động điền thông tin khi phân tích phong thủy
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                <Phone className="w-4 h-4" />
                Số điện thoại (tùy chọn)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Giúp tự động điền thông tin khi mua sim
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                <MapPin className="w-4 h-4" />
                Địa chỉ (tùy chọn)
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ nhận sim"
                rows="2"
                className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Giúp tự động điền địa chỉ khi mua sim
              </p>
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

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                <Lock className="w-4 h-4" />
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-primary/30 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng Ký"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
