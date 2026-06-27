import { Filter, X } from "lucide-react";
import { useState } from "react";

export default function AdvancedFilter({ onFilterChange, onClose }) {
  const [filters, setFilters] = useState({
    network: [],
    simType: [],
    minPrice: 500000,
    maxPrice: 5000000,
    specialNumbers: "",
    anniversaryDate: "",
  });

  const networks = ["Viettel", "Vinaphone", "Mobifone"];
  const simTypes = [
    { value: "tam-hoa", label: "Sim Tam Hoa" },
    { value: "tu-quy", label: "Sim Tứ Quý" },
    { value: "than-tai", label: "Sim Thần Tài" },
    { value: "loc-phat", label: "Sim Lộc Phát" },
  ];

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      const newFilters = { ...prev, [category]: updated };
      
      // Tự động áp dụng filter
      setTimeout(() => onFilterChange(newFilters), 0);
      return newFilters;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      
      // Tự động áp dụng filter
      if (name === 'specialNumbers' || name === 'anniversaryDate') {
        setTimeout(() => onFilterChange(newFilters), 300);
      }
      return newFilters;
    });
  };

  const handlePriceSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setFilters((prev) => {
      const newFilters = { ...prev, maxPrice: value };
      setTimeout(() => onFilterChange(newFilters), 100);
      return newFilters;
    });
  };

  const handleApply = () => {
    onFilterChange(filters);
    // Scroll lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    const resetFilters = {
      network: [],
      simType: [],
      minPrice: 500000,
      maxPrice: 5000000,
      specialNumbers: "",
      anniversaryDate: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    
    // Scroll lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
          <Filter className="text-primary" />
          Bộ lọc thông minh
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Nhà mạng */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Nhà mạng
          </label>
          <div className="flex flex-wrap gap-2">
            {networks.map((network) => (
              <button
                key={network}
                onClick={() => handleCheckbox("network", network)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  filters.network.includes(network)
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-dark border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary"
                }`}
              >
                {network}
              </button>
            ))}
          </div>
        </div>

        {/* Loại sim */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Loại sim đặc biệt
          </label>
          <div className="grid grid-cols-2 gap-2">
            {simTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleCheckbox("simType", type.value)}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                  filters.simType.includes(type.value)
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-dark border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Khoảng giá */}
        <div>
          <label className="block text-sm font-semibold mb-2 dark:text-gray-200">
            Ngân sách tối đa: <span className="text-primary font-bold">{formatPrice(filters.maxPrice)} đ</span>
          </label>
          <input
            type="range"
            name="maxPrice"
            min="500000"
            max="5000000"
            step="50000"
            value={filters.maxPrice}
            onChange={handlePriceSliderChange}
            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((filters.maxPrice - 500000) / (5000000 - 500000)) * 100}%, #e5e7eb ${((filters.maxPrice - 500000) / (5000000 - 500000)) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>500.000 đ</span>
            <span>5.000.000 đ</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            💡 Kéo thanh để xem sim từ 500.000đ đến {formatPrice(filters.maxPrice)}đ
          </p>
        </div>

        {/* Số đặc biệt */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Tìm số đặc biệt (ngày sinh, kỷ niệm...)
          </label>
          <input
            type="text"
            name="specialNumbers"
            value={filters.specialNumbers}
            onChange={handleChange}
            placeholder="Vd: 0312, 1995, 2510"
            className="w-full bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Nhập các dãy số bạn muốn tìm trong sim
          </p>
        </div>

        {/* Ngày kỷ niệm */}
        <div>
          <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
            Ngày kỷ niệm
          </label>
          <input
            type="date"
            name="anniversaryDate"
            value={filters.anniversaryDate}
            onChange={handleChange}
            className="w-full bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tìm sim có chứa ngày/tháng này
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Đặt lại
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-primary/30"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
