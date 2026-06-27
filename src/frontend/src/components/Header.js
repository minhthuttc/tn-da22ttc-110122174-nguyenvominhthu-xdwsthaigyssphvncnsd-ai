"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    // Load user từ localStorage khi component mount
    const loadUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Lắng nghe sự kiện storage để cập nhật khi localStorage thay đổi
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
                {/* Circle outline with gradient */}
                <circle cx="50" cy="50" r="44" stroke="url(#goldGradient)" strokeWidth="6" fill="none"/>
                
                {/* SIM card with cut corner */}
                <path d="M30 25 L30 75 L70 75 L70 40 L55 25 Z" fill="url(#goldGradient)"/>
                
                {/* Chip pattern (white rectangles) */}
                <rect x="38" y="48" width="8" height="8" fill="white" rx="1"/>
                <rect x="48" y="48" width="8" height="8" fill="white" rx="1"/>
                <rect x="58" y="48" width="8" height="8" fill="white" rx="1"/>
                <rect x="38" y="58" width="8" height="8" fill="white" rx="1"/>
                <rect x="48" y="58" width="8" height="8" fill="white" rx="1"/>
                <rect x="58" y="58" width="8" height="8" fill="white" rx="1"/>
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4af37"/>
                    <stop offset="50%" stopColor="#ffd700"/>
                    <stop offset="100%" stopColor="#f4c430"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                MINHTHUSIM
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
                Sim Số Đẹp Phong Thủy
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="font-medium hover:text-primary transition-colors">Trang chủ</Link>
            <Link href="/kho-so" className="font-medium hover:text-primary transition-colors">Kho số</Link>
            {user && user.role !== 'admin' && (
              <>
                <Link href="/phong-thuy" className="font-medium hover:text-primary transition-colors">Xem Phong Thủy</Link>
                <Link href="/lien-he" className="font-medium hover:text-primary transition-colors">Liên hệ</Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link 
                  href="/tai-khoan"
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-full border-2 border-blue-200 dark:border-gray-600 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-medium transition"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium hover:text-primary transition-colors px-4 py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full font-medium transition-transform transform hover:scale-105 shadow-lg shadow-primary/30"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
