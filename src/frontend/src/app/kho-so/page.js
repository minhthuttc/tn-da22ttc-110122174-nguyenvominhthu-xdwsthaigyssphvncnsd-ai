"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import SimCard from "@/components/SimCard";
import AdvancedFilter from "@/components/AdvancedFilter";

export default function KhoSoPage() {
  const [loading, setLoading] = useState(false);
  const [sims, setSims] = useState([]);
  const [filteredSims, setFilteredSims] = useState([]);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    fetchAllSims();
  }, []);

  const fetchAllSims = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/sims");
      if (res.data.success) {
        // Chỉ hiển thị sim còn hàng trong kho
        const availableSims = res.data.data.filter(sim => sim.status === 'Còn hàng');
        setSims(availableSims);
        setFilteredSims(availableSims);
      }
    } catch (err) {
      console.error("Error fetching sims:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filterData) => {
    let filtered = [...sims];

    // Lọc theo nhà mạng
    if (filterData.network && filterData.network.length > 0) {
      filtered = filtered.filter((sim) =>
        filterData.network.includes(sim.network)
      );
    }

    // Lọc theo loại sim
    if (filterData.simType && filterData.simType.length > 0) {
      filtered = filtered.filter((sim) => {
        const simNumber = sim.sim_number;
        const category = sim.category ? sim.category.toLowerCase() : "";
        const lastTwo = simNumber.slice(-2); // 2 số cuối
        const lastThree = simNumber.slice(-3); // 3 số cuối
        const lastFour = simNumber.slice(-4); // 4 số cuối
        
        return filterData.simType.some((type) => {
          switch (type) {
            case "tam-hoa":
              // Tìm tam hoa ở đuôi (3 số cuối giống nhau)
              return /(\d)\1{2}$/.test(simNumber) || category.includes("tam hoa");
            case "tu-quy":
              // Tìm tứ quý ở đuôi (4 số cuối giống nhau)
              return /(\d)\1{3}$/.test(simNumber) || category.includes("tứ quý");
            case "than-tai":
              // Tìm 39 hoặc 79 ở đuôi
              return lastTwo === "39" || lastTwo === "79" || category.includes("thần tài");
            case "loc-phat":
              // Tìm 68, 86, 78 ở đuôi
              return lastTwo === "68" || lastTwo === "86" || lastTwo === "78" || category.includes("lộc phát");
            default:
              return false;
          }
        });
      });
    }

    // Lọc theo giá
    if (filterData.minPrice !== undefined && filterData.maxPrice !== undefined) {
      filtered = filtered.filter(
        (sim) => sim.price >= filterData.minPrice && sim.price <= filterData.maxPrice
      );
    }

    // Lọc theo số đặc biệt
    if (filterData.specialNumbers && filterData.specialNumbers.trim() !== "") {
      const specialNums = filterData.specialNumbers.split(",").map((n) => n.trim());
      filtered = filtered.filter((sim) =>
        specialNums.some((num) => sim.sim_number.includes(num))
      );
    }

    // Lọc theo ngày kỷ niệm
    if (filterData.anniversaryDate) {
      const date = new Date(filterData.anniversaryDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      
      // Tìm 2 số cuối của sim khớp với ngày hoặc tháng
      filtered = filtered.filter((sim) => {
        const simNum = sim.sim_number;
        const lastTwo = simNum.slice(-2); // Lấy 2 số cuối
        return lastTwo === day || lastTwo === month;
      });
    }

    setFilteredSims(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold dark:text-white mb-4">
            Kho Số <span className="text-primary">MINHTHUSIM</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Khám phá hàng ngàn sim số đẹp với bộ lọc thông minh
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <AdvancedFilter onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Sim List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Đang tải kho sim...
                </p>
              </div>
            ) : filteredSims.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Không tìm thấy sim nào phù hợp với bộ lọc
                </p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  Hãy thử điều chỉnh bộ lọc để xem thêm kết quả
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Tìm thấy <span className="font-bold text-primary">{filteredSims.length}</span> sim
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredSims.map((sim) => (
                    <SimCard key={sim.id_sim || sim.sim_number} sim={sim} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
