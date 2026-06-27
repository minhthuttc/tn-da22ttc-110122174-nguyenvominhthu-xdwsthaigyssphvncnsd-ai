"use client";

import { useState } from "react";
import { Calendar, Clock, Sparkles, User, BookOpen, Phone } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function PhongThuyPage() {
  const [viewMode, setViewMode] = useState(null); // 'self' or 'others'
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState(null);
  const [calendarType, setCalendarType] = useState(null);
  const [result, setResult] = useState(null);
  const [suggestedSims, setSuggestedSims] = useState([]);

  const handleViewModeSelect = (mode) => {
    setViewMode(mode);
    
    if (mode === 'self') {
      // Auto-fill from user data if logged in
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.birthDate) {
          setBirthDate(user.birthDate);
        }
      }
    } else {
      // Reset form for others
      setBirthDate("");
      setBirthTime("");
      setGender(null);
      setCalendarType(null);
    }
  };

  const calculateFengShui = async () => {
    if (!birthDate) {
      alert("Vui lòng nhập ngày sinh!");
      return;
    }

    if (!gender) {
      alert("Vui lòng chọn giới tính!");
      return;
    }

    if (!calendarType) {
      alert("Vui lòng chọn loại lịch!");
      return;
    }

    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Tính Can Chi theo năm sinh
    const canChiYear = getCanChiYear(year);
    
    // Tính mệnh theo Nạp Âm (chính xác hơn)
    const element = getElementByNapAm(year);
    const elementColor = getElementColor(element);
    
    // Tính số may mắn dựa trên mệnh và giới tính
    const luckyNumbers = getLuckyNumbers(element, gender);
    
    // Tính màu sắc may mắn
    const luckyColors = getLuckyColors(element, gender);
    
    // Tính hướng may mắn dựa trên mệnh và giới tính
    const direction = getLuckyDirection(element, gender);
    
    // Phân tích giờ sinh nếu có
    let birthHourInfo = null;
    let hourCompatibility = null;
    if (birthTime) {
      const hour = parseInt(birthTime.split(":")[0]);
      birthHourInfo = getBirthHourElement(hour);
      hourCompatibility = checkElementCompatibility(element, birthHourInfo.element);
    }
    
    // Phân tích tính cách dựa trên mệnh và giới tính
    const personality = getPersonality(element, gender);
    
    // Phân tích nghề nghiệp phù hợp
    const suitableCareer = getSuitableCareer(element, gender);
    
    // Phân tích tình duyên
    const loveCompatibility = getLoveCompatibility(element, gender);
    
    // Phân tích tài lộc
    const wealthFortune = getWealthFortune(element, birthHourInfo?.element);
    
    // Lời khuyên phong thủy
    const advice = getFengShuiAdvice(element, gender, calendarType);

    setResult({
      element,
      elementColor,
      luckyNumbers,
      luckyColors,
      direction,
      year,
      month,
      day,
      gender,
      calendarType,
      canChiYear,
      birthHourInfo,
      hourCompatibility,
      personality,
      suitableCareer,
      loveCompatibility,
      wealthFortune,
      advice
    });

    // Lưu lịch sử xem phong thủy
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        await axios.post("http://localhost:5000/api/fengshui-history", {
          user_id: user.id,
          user_name: user.name,
          birth_date: birthDate,
          birth_time: birthTime || null,
          gender: gender,
          calendar_type: calendarType,
          element: element,
          lucky_numbers: luckyNumbers.join(", ")
        });
      }
    } catch (error) {
      console.error("Error saving fengshui history:", error);
      // Không hiển thị lỗi cho user, chỉ log
    }

    // Fetch sim suggestions based on lucky numbers
    try {
      const response = await axios.get("http://localhost:5000/api/sims");
      if (response.data.success) {
        // Filter sims that contain lucky numbers
        const filtered = response.data.data
          .filter(sim => {
            const simStr = sim.so_sim || '';
            return luckyNumbers.some(num => simStr.includes(num.toString()));
          })
          .slice(0, 6) // Get top 6 sims
          .map(sim => ({
            ...sim,
            sim_number: sim.so_sim,
            network: sim.nha_mang,
            price: sim.gia_ban,
            category: sim.loai_sim,
            status: sim.trang_thai
          }));
        setSuggestedSims(filtered);
      }
    } catch (error) {
      console.error("Error fetching sim suggestions:", error);
    }

    // Scroll xuống kết quả
    setTimeout(() => {
      const resultElement = document.getElementById('result-section');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Hàm tính mệnh theo Nạp Âm (chính xác)
  const getElementByNapAm = (year) => {
    // Bảng Nạp Âm 60 năm
    const napAm = {
      // Giáp Tý (1924, 1984) - Hải Trung Kim
      0: "Kim", 1: "Kim",
      // Bính Dần (1926, 1986) - Lư Trung Hỏa
      2: "Hỏa", 3: "Hỏa",
      // Mậu Thìn (1928, 1988) - Đại Lâm Mộc
      4: "Mộc", 5: "Mộc",
      // Canh Ngọ (1930, 1990) - Lộ Bàng Thổ
      6: "Thổ", 7: "Thổ",
      // Nhâm Thân (1932, 1992) - Kiếm Phong Kim
      8: "Kim", 9: "Kim",
      // Giáp Tuất (1934, 1994) - Sơn Đầu Hỏa
      10: "Hỏa", 11: "Hỏa",
      // Bính Tý (1936, 1996) - Giản Hạ Thủy
      12: "Thủy", 13: "Thủy",
      // Mậu Dần (1938, 1998) - Thành Đầu Thổ
      14: "Thổ", 15: "Thổ",
      // Canh Thìn (1940, 2000) - Bạch Lạp Kim
      16: "Kim", 17: "Kim",
      // Nhâm Ngọ (1942, 2002) - Dương Liễu Mộc
      18: "Mộc", 19: "Mộc",
      // Giáp Thân (1944, 2004) - Tuyền Trung Thủy
      20: "Thủy", 21: "Thủy",
      // Bính Tuất (1946, 2006) - Ốc Thượng Thổ
      22: "Thổ", 23: "Thổ",
      // Mậu Tý (1948, 2008) - Tích Lịch Hỏa
      24: "Hỏa", 25: "Hỏa",
      // Canh Dần (1950, 2010) - Tùng Bách Mộc
      26: "Mộc", 27: "Mộc",
      // Nhâm Thìn (1952, 2012) - Trường Lưu Thủy
      28: "Thủy", 29: "Thủy",
      // Giáp Ngọ (1954, 2014) - Sa Trung Kim
      30: "Kim", 31: "Kim",
      // Bính Thân (1956, 2016) - Sơn Hạ Hỏa
      32: "Hỏa", 33: "Hỏa",
      // Mậu Tuất (1958, 2018) - Bình Địa Mộc
      34: "Mộc", 35: "Mộc",
      // Canh Tý (1960, 2020) - Bích Thượng Thổ
      36: "Thổ", 37: "Thổ",
      // Nhâm Dần (1962, 2022) - Kim Bạch Kim
      38: "Kim", 39: "Kim",
      // Giáp Thìn (1964, 2024) - Phúc Đăng Hỏa
      40: "Hỏa", 41: "Hỏa",
      // Bính Ngọ (1966, 2026) - Thiên Hà Thủy
      42: "Thủy", 43: "Thủy",
      // Mậu Thân (1968, 2028) - Đại Trạch Thổ
      44: "Thổ", 45: "Thổ",
      // Canh Tuất (1970, 2030) - Thoa Xuyến Kim
      46: "Kim", 47: "Kim",
      // Nhâm Tý (1972, 2032) - Tang Đố Mộc
      48: "Mộc", 49: "Mộc",
      // Giáp Dần (1974, 2034) - Đại Khê Thủy
      50: "Thủy", 51: "Thủy",
      // Bính Thìn (1976, 2036) - Sa Trung Thổ
      52: "Thổ", 53: "Thổ",
      // Mậu Ngọ (1978, 2038) - Thiên Thượng Hỏa
      54: "Hỏa", 55: "Hỏa",
      // Canh Thân (1980, 2040) - Thạch Lựu Mộc
      56: "Mộc", 57: "Mộc",
      // Nhâm Tuất (1982, 2042) - Đại Hải Thủy
      58: "Thủy", 59: "Thủy"
    };
    
    // Tính vị trí trong chu kỳ 60 năm (bắt đầu từ 1924)
    const baseYear = 1924;
    const position = (year - baseYear) % 60;
    
    return napAm[position] || "Mộc";
  };

  // Hàm tính Can Chi năm
  const getCanChiYear = (year) => {
    const can = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
    const chi = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
    return `${can[year % 10]} ${chi[year % 12]}`;
  };

  // Hàm xác định mệnh
  const getElement = (yearMod) => {
    if (yearMod === 0 || yearMod === 1) return "Kim";
    if (yearMod === 2 || yearMod === 3) return "Thủy";
    if (yearMod === 4 || yearMod === 5) return "Hỏa";
    if (yearMod === 6 || yearMod === 7) return "Thổ";
    return "Mộc";
  };

  const getElementColor = (element) => {
    const colors = {
      "Kim": "text-yellow-600",
      "Thủy": "text-blue-600",
      "Hỏa": "text-red-600",
      "Thổ": "text-amber-700",
      "Mộc": "text-green-600"
    };
    return colors[element];
  };

  // Hàm tính số may mắn dựa trên mệnh và giới tính
  const getLuckyNumbers = (element, gender) => {
    const baseNumbers = {
      "Kim": [4, 9],
      "Thủy": [1, 6],
      "Hỏa": [2, 7],
      "Thổ": [5, 0],
      "Mộc": [3, 8]
    };
    
    let numbers = [...baseNumbers[element]];
    // Thêm số phụ dựa trên giới tính
    if (gender === "male") {
      numbers.push(numbers[0] + 1);
    } else {
      numbers.push(numbers[1] - 1);
    }
    return numbers.filter(n => n >= 0 && n <= 9).slice(0, 3);
  };

  // Hàm tính màu sắc may mắn
  const getLuckyColors = (element, gender) => {
    const baseColors = {
      "Kim": ["Trắng", "Vàng", "Nâu"],
      "Thủy": ["Đen", "Xanh dương", "Xám"],
      "Hỏa": ["Đỏ", "Hồng", "Tím"],
      "Thổ": ["Vàng", "Nâu", "Cam"],
      "Mộc": ["Xanh lá", "Xanh lơ", "Xanh ngọc"]
    };
    
    let colors = [...baseColors[element]];
    if (gender === "female") {
      colors.push("Hồng nhạt");
    }
    return colors;
  };

  // Hàm tính hướng may mắn
  const getLuckyDirection = (element, gender) => {
    const directions = {
      "Kim": gender === "male" ? "Tây, Tây Bắc" : "Tây, Tây Nam",
      "Thủy": gender === "male" ? "Bắc" : "Bắc, Đông Bắc",
      "Hỏa": gender === "male" ? "Nam" : "Nam, Đông Nam",
      "Thổ": gender === "male" ? "Trung tâm, Tây Nam" : "Trung tâm, Đông Bắc",
      "Mộc": gender === "male" ? "Đông, Đông Nam" : "Đông, Đông Bắc"
    };
    return directions[element];
  };

  // Kiểm tra tương sinh tương khắc
  const checkElementCompatibility = (element1, element2) => {
    const compatibility = {
      "Kim-Thủy": { type: "sinh", desc: "Kim sinh Thủy - Rất tốt, giúp tăng cường vận khí" },
      "Thủy-Mộc": { type: "sinh", desc: "Thủy sinh Mộc - Rất tốt, mang lại may mắn" },
      "Mộc-Hỏa": { type: "sinh", desc: "Mộc sinh Hỏa - Rất tốt, thúc đẩy sự nghiệp" },
      "Hỏa-Thổ": { type: "sinh", desc: "Hỏa sinh Thổ - Rất tốt, ổn định tài chính" },
      "Thổ-Kim": { type: "sinh", desc: "Thổ sinh Kim - Rất tốt, tăng cường sức khỏe" },
      "Kim-Mộc": { type: "khắc", desc: "Kim khắc Mộc - Cần cẩn trọng, có thể gặp trở ngại" },
      "Mộc-Thổ": { type: "khắc", desc: "Mộc khắc Thổ - Cần chú ý, tránh xung đột" },
      "Thổ-Thủy": { type: "khắc", desc: "Thổ khắc Thủy - Cần hóa giải, có thể ảnh hưởng sức khỏe" },
      "Thủy-Hỏa": { type: "khắc", desc: "Thủy khắc Hỏa - Cần cân bằng, tránh mâu thuẫn" },
      "Hỏa-Kim": { type: "khắc", desc: "Hỏa khắc Kim - Cần điều hòa, có thể gặp khó khăn tài chính" }
    };
    
    const key1 = `${element1}-${element2}`;
    const key2 = `${element2}-${element1}`;
    
    if (compatibility[key1]) return compatibility[key1];
    if (compatibility[key2]) return { ...compatibility[key2], reversed: true };
    return { type: "bình", desc: "Hai mệnh hòa hợp, không xung khắc" };
  };

  // Phân tích tính cách
  const getPersonality = (element, gender) => {
    const personalities = {
      "Kim": {
        male: "Mạnh mẽ, quyết đoán, có tính lãnh đạo cao. Thích sự rõ ràng và nguyên tắc.",
        female: "Kiên cường, độc lập, có chí tiến thủ. Thông minh và sắc sảo trong công việc."
      },
      "Thủy": {
        male: "Linh hoạt, thông minh, biết thích nghi. Có khả năng giao tiếp tốt.",
        female: "Dịu dàng, nhạy cảm, giàu cảm xúc. Có trực giác tốt và sự đồng cảm cao."
      },
      "Hỏa": {
        male: "Nhiệt huyết, năng động, đầy nhiệt tình. Có khả năng lãnh đạo và truyền cảm hứng.",
        female: "Sôi nổi, tự tin, quyến rũ. Có sức hút mạnh mẽ và khả năng thuyết phục cao."
      },
      "Thổ": {
        male: "Chân thành, đáng tin cậy, kiên nhẫn. Có tính thực tế và ổn định.",
        female: "Hiền lành, chu đáo, chăm sóc người khác. Có khả năng tổ chức và quản lý tốt."
      },
      "Mộc": {
        male: "Sáng tạo, lạc quan, yêu tự do. Có khả năng phát triển và mở rộng.",
        female: "Nhẹ nhàng, tinh tế, giàu lòng nhân ái. Có khiếu thẩm mỹ và nghệ thuật."
      }
    };
    return personalities[element][gender];
  };

  // Nghề nghiệp phù hợp
  const getSuitableCareer = (element, gender) => {
    const careers = {
      "Kim": "Tài chính, Ngân hàng, Kế toán, Luật sư, Kỹ sư cơ khí, Kinh doanh kim loại",
      "Thủy": "Marketing, Truyền thông, Du lịch, Ngoại thương, Vận tải, Kinh doanh đồ uống",
      "Hỏa": "Giáo dục, Nghệ thuật, Điện tử, Công nghệ thông tin, Năng lượng, Nhà hàng",
      "Thổ": "Bất động sản, Xây dựng, Nông nghiệp, Y tế, Giáo dục, Quản lý",
      "Mộc": "Thiết kế, Nghệ thuật, Thời trang, Xuất bản, Môi trường, Dược phẩm"
    };
    return careers[element];
  };

  // Tình duyên
  const getLoveCompatibility = (element, gender) => {
    const love = {
      "Kim": {
        best: "Thổ, Thủy",
        avoid: "Hỏa, Mộc",
        advice: "Nên tìm người mệnh Thổ hoặc Thủy để có mối quan hệ hài hòa."
      },
      "Thủy": {
        best: "Kim, Mộc",
        avoid: "Thổ",
        advice: "Hợp với người mệnh Kim hoặc Mộc, mang lại hạnh phúc lâu dài."
      },
      "Hỏa": {
        best: "Mộc, Thổ",
        avoid: "Thủy, Kim",
        advice: "Nên chọn người mệnh Mộc hoặc Thổ để có cuộc sống ấm áp."
      },
      "Thổ": {
        best: "Hỏa, Kim",
        avoid: "Mộc",
        advice: "Phù hợp với người mệnh Hỏa hoặc Kim, tạo nên sự ổn định."
      },
      "Mộc": {
        best: "Thủy, Hỏa",
        avoid: "Kim, Thổ",
        advice: "Hợp với người mệnh Thủy hoặc Hỏa, mối quan hệ phát triển tốt."
      }
    };
    return love[element];
  };

  // Tài lộc
  const getWealthFortune = (element, hourElement) => {
    const wealth = {
      "Kim": "Tài lộc ổn định, có khả năng tích lũy tốt. Nên đầu tư vào kim loại quý, bất động sản.",
      "Thủy": "Tài lộc lưu thông, có nhiều cơ hội kiếm tiền. Phù hợp kinh doanh, thương mại.",
      "Hỏa": "Tài lộc đến nhanh nhưng cũng đi nhanh. Cần biết tiết kiệm và đầu tư khôn ngoan.",
      "Thổ": "Tài lộc vững chắc, tích lũy từ từ. Nên đầu tư dài hạn, bất động sản.",
      "Mộc": "Tài lộc phát triển tốt, có nhiều nguồn thu nhập. Phù hợp kinh doanh sáng tạo."
    };
    
    let fortune = wealth[element];
    if (hourElement) {
      const compatibility = checkElementCompatibility(element, hourElement);
      if (compatibility.type === "sinh") {
        fortune += " Giờ sinh hỗ trợ tốt, tăng cường vận tài lộc.";
      }
    }
    return fortune;
  };

  // Lời khuyên phong thủy
  const getFengShuiAdvice = (element, gender, calendarType) => {
    const advice = {
      "Kim": [
        "Nên đặt đồ vật bằng kim loại ở hướng Tây hoặc Tây Bắc",
        "Trồng cây cảnh có lá tròn để tăng vận may",
        "Tránh đặt bể cá quá lớn trong nhà",
        "Nên mặc trang sức vàng, bạc để tăng cường vận khí"
      ],
      "Thủy": [
        "Đặt bể cá hoặc thác nước ở hướng Bắc",
        "Sử dụng màu đen, xanh dương trong trang trí",
        "Tránh đặt đồ vật màu đỏ, vàng quá nhiều",
        "Nên uống nhiều nước và giữ gìn sức khỏe"
      ],
      "Hỏa": [
        "Đặt đèn hoặc촛 nến ở hướng Nam",
        "Sử dụng màu đỏ, cam trong trang trí",
        "Tránh đặt bể nước lớn trong phòng ngủ",
        "Nên tập thể dục thường xuyên để giữ năng lượng"
      ],
      "Thổ": [
        "Đặt đồ gốm sứ hoặc đá tự nhiên trong nhà",
        "Sử dụng màu vàng, nâu trong trang trí",
        "Trồng cây cảnh để tăng sinh khí",
        "Nên ăn uống điều độ và nghỉ ngơi đầy đủ"
      ],
      "Mộc": [
        "Trồng nhiều cây xanh trong nhà",
        "Sử dụng đồ nội thất bằng gỗ tự nhiên",
        "Đặt cây cảnh ở hướng Đông hoặc Đông Nam",
        "Nên tiếp xúc với thiên nhiên thường xuyên"
      ]
    };
    
    return advice[element];
  };

  const getBirthHourElement = (hour) => {
    const hourMap = [
      { range: "23:00 - 01:00", name: "Giờ Tý", element: "Thủy", trait: "Thông minh, linh hoạt" },
      { range: "01:00 - 03:00", name: "Giờ Sửu", element: "Thổ", trait: "Chăm chỉ, kiên nhẫn" },
      { range: "03:00 - 05:00", name: "Giờ Dần", element: "Mộc", trait: "Dũng cảm, quyết đoán" },
      { range: "05:00 - 07:00", name: "Giờ Mão", element: "Mộc", trait: "Nhẹ nhàng, tinh tế" },
      { range: "07:00 - 09:00", name: "Giờ Thìn", element: "Thổ", trait: "Mạnh mẽ, tự tin" },
      { range: "09:00 - 11:00", name: "Giờ Tỵ", element: "Hỏa", trait: "Nhiệt huyết, năng động" },
      { range: "11:00 - 13:00", name: "Giờ Ngọ", element: "Hỏa", trait: "Sáng tạo, lạc quan" },
      { range: "13:00 - 15:00", name: "Giờ Mùi", element: "Thổ", trait: "Hiền lành, chu đáo" },
      { range: "15:00 - 17:00", name: "Giờ Thân", element: "Kim", trait: "Thông minh, nhanh nhẹn" },
      { range: "17:00 - 19:00", name: "Giờ Dậu", element: "Kim", trait: "Cẩn thận, tỉ mỉ" },
      { range: "19:00 - 21:00", name: "Giờ Tuất", element: "Thổ", trait: "Trung thành, đáng tin" },
      { range: "21:00 - 23:00", name: "Giờ Hợi", element: "Thủy", trait: "Hòa đồng, dễ gần" }
    ];

    if (hour >= 23 || hour < 1) return hourMap[0];
    if (hour >= 1 && hour < 3) return hourMap[1];
    if (hour >= 3 && hour < 5) return hourMap[2];
    if (hour >= 5 && hour < 7) return hourMap[3];
    if (hour >= 7 && hour < 9) return hourMap[4];
    if (hour >= 9 && hour < 11) return hourMap[5];
    if (hour >= 11 && hour < 13) return hourMap[6];
    if (hour >= 13 && hour < 15) return hourMap[7];
    if (hour >= 15 && hour < 17) return hourMap[8];
    if (hour >= 17 && hour < 19) return hourMap[9];
    if (hour >= 19 && hour < 21) return hourMap[10];
    return hourMap[11];
  };

  const handleReset = () => {
    setBirthDate("");
    setBirthTime("");
    setGender(null);
    setCalendarType(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-dark dark:via-dark-lighter dark:to-dark py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold dark:text-white">
              Xem Phong Thủy
            </h1>
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Khám phá mệnh ngũ hành và con số may mắn của bạn
          </p>
        </div>

        {/* Mode Selection */}
        {!viewMode ? (
          <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-center dark:text-white mb-6">
              Bạn muốn xem phong thủy cho ai?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check if user is logged in */}
              {(() => {
                const userData = localStorage.getItem("user");
                const isLoggedIn = !!userData;
                
                return (
                  <>
                    {isLoggedIn ? (
                      <button
                        onClick={() => handleViewModeSelect('self')}
                        className="group relative overflow-hidden bg-gradient-to-br from-primary to-amber-500 hover:from-amber-500 hover:to-primary text-white rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105"
                      >
                        <div className="relative z-10">
                          <User className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">Xem cho bản thân</h3>
                          <p className="text-sm opacity-90">
                            Thông tin của bạn sẽ được tự động điền sẵn
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      </button>
                    ) : (
                      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8">
                        <div className="text-center">
                          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-2xl font-bold mb-2 text-gray-500 dark:text-gray-400">Xem cho bản thân</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Vui lòng đăng nhập để sử dụng tính năng này
                          </p>
                          <a
                            href="/login"
                            className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold transition"
                          >
                            Đăng nhập ngay
                          </a>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleViewModeSelect('others')}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white rounded-xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105"
                    >
                      <div className="relative z-10">
                        <BookOpen className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Xem cho người khác</h3>
                        <p className="text-sm opacity-90">
                          Nhập thông tin của người bạn muốn xem
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold dark:text-white">
                  {viewMode === 'self' ? '🙋 Xem cho bản thân' : '👥 Xem cho người khác'}
                </h2>
                <button
                  onClick={() => {
                    setViewMode(null);
                    setResult(null);
                  }}
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  ← Quay lại
                </button>
              </div>

              <div className="space-y-6">
                {/* Ngày sinh - Only show for 'others' mode */}
                {viewMode === 'self' ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Calendar className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Ngày sinh của bạn</p>
                        <p className="text-sm">
                          {birthDate ? new Date(birthDate).toLocaleDateString('vi-VN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'Chưa cập nhật trong hồ sơ'}
                        </p>
                      </div>
                    </div>
                    {!birthDate && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        💡 Vui lòng cập nhật ngày sinh trong hồ sơ để sử dụng tính năng này
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3 dark:text-gray-200">
                      <Calendar className="w-5 h-5 text-primary" />
                      Ngày tháng năm sinh
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                )}

                {/* Giờ sinh */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3 dark:text-gray-200">
                    <Clock className="w-5 h-5 text-primary" />
                    Giờ sinh (không bắt buộc)
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Nhập giờ sinh để xem phân tích chi tiết hơn
                  </p>
            </div>

            {/* Giới tính */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3 dark:text-gray-200">
                <User className="w-5 h-5 text-primary" />
                Giới tính
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender("male")}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    gender === "male"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Nam
                </button>
                <button
                  onClick={() => setGender("female")}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    gender === "female"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Nữ
                </button>
              </div>
            </div>

            {/* Loại lịch */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3 dark:text-gray-200">
                <BookOpen className="w-5 h-5 text-primary" />
                Loại lịch
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setCalendarType("solar")}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    calendarType === "solar"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Dương lịch
                </button>
                <button
                  onClick={() => setCalendarType("lunar")}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    calendarType === "lunar"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Âm lịch
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Đặt lại
              </button>
              <button
                onClick={calculateFengShui}
                disabled={!birthDate || !gender || !calendarType}
                className={`flex-1 py-3 rounded-lg font-semibold transition shadow-lg ${
                  birthDate && gender && calendarType
                    ? "bg-primary hover:bg-primary-hover text-white shadow-primary/30 cursor-pointer"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                Xem Phong Thủy
              </button>
            </div>
          </div>
        </div>
        </>
        )}

        {result && (
          <div id="result-section" className="bg-white dark:bg-dark-lighter rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
              Kết Quả Phong Thủy - Phân Tích AI
            </h2>

            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">📋 Thông Tin Cơ Bản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Giới tính</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {result.gender === "male" ? "Nam" : "Nữ"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loại lịch</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {result.calendarType === "solar" ? "Dương lịch" : "Âm lịch"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Năm Can Chi</p>
                    <p className="text-lg font-semibold dark:text-white">{result.canChiYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Năm sinh</p>
                    <p className="text-lg font-semibold dark:text-white">{result.year}</p>
                  </div>
                </div>
              </div>

              {/* Mệnh */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">🔮 Mệnh Ngũ Hành</h3>
                <p className="text-3xl font-bold mb-2">
                  <span className={result.elementColor}>Mệnh {result.element}</span>
                </p>
              </div>

              {/* Giờ sinh và tương sinh tương khắc */}
              {result.birthHourInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3 dark:text-white">⏰ Giờ Sinh & Tương Sinh Khắc</h3>
                  <p className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                    {result.birthHourInfo.name} ({result.birthHourInfo.range})
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Hành:</span> {result.birthHourInfo.element}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    <span className="font-semibold">Tính cách:</span> {result.birthHourInfo.trait}
                  </p>
                  {result.hourCompatibility && (
                    <div className={`p-3 rounded-lg ${
                      result.hourCompatibility.type === 'sinh' ? 'bg-green-100 dark:bg-green-900/30' :
                      result.hourCompatibility.type === 'khắc' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <p className="font-semibold text-sm dark:text-white">
                        {result.hourCompatibility.type === 'sinh' ? '✅ Tương Sinh' :
                         result.hourCompatibility.type === 'khắc' ? '⚠️ Tương Khắc' : '➖ Bình Hòa'}
                      </p>
                      <p className="text-sm mt-1 dark:text-gray-300">{result.hourCompatibility.desc}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tính cách */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">👤 Tính Cách</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.personality}</p>
              </div>

              {/* Con số may mắn */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">🎲 Con Số May Mắn</h3>
                <div className="flex gap-4">
                  {result.luckyNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
                    >
                      {num}
                    </div>
                  ))}
                </div>
                
                {/* Sim suggestions based on lucky numbers */}
                {suggestedSims.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-green-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold dark:text-white flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" />
                        Sim phù hợp với số may mắn của bạn
                      </h4>
                      <Link 
                        href="/kho-so"
                        className="text-sm text-primary hover:text-primary-hover font-medium"
                      >
                        Xem thêm →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {suggestedSims.map((sim, idx) => (
                        <Link
                          key={idx}
                          href="/kho-so"
                          className="bg-white dark:bg-gray-700 rounded-lg p-3 hover:shadow-lg transition-shadow border border-green-200 dark:border-gray-600"
                        >
                          <div className="text-center">
                            <p className="text-primary font-bold text-lg mb-1">
                              {sim.sim_number?.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{sim.network}</p>
                            <p className="text-sm font-semibold text-red-500">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sim.price)}
                            </p>
                            {sim.status === 'Đã bán' && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">Đã đặt</span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 italic">
                      💡 Các sim này chứa số may mắn của bạn, giúp tăng cường vận khí tốt lành
                    </p>
                  </div>
                )}
              </div>

              {/* Màu sắc may mắn */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">🎨 Màu Sắc May Mắn</h3>
                <div className="flex flex-wrap gap-3">
                  {result.luckyColors.map((color, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white dark:bg-gray-600 rounded-full text-gray-700 dark:text-gray-200 font-medium shadow"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hướng may mắn */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">🧭 Hướng May Mắn</h3>
                <p className="text-xl font-semibold text-amber-700 dark:text-amber-400">
                  {result.direction}
                </p>
              </div>

              {/* Nghề nghiệp phù hợp */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">💼 Nghề Nghiệp Phù Hợp</h3>
                <p className="text-gray-700 dark:text-gray-300">{result.suitableCareer}</p>
              </div>

              {/* Tình duyên */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">💕 Tình Duyên</h3>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Hợp:</span> Mệnh {result.loveCompatibility.best}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Tránh:</span> Mệnh {result.loveCompatibility.avoid}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 italic mt-2">
                    💡 {result.loveCompatibility.advice}
                  </p>
                </div>
              </div>

              {/* Tài lộc */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">💰 Tài Lộc</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.wealthFortune}</p>
              </div>

              {/* Lời khuyên phong thủy */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">💡 Lời Khuyên Phong Thủy</h3>
                <ul className="space-y-2">
                  {result.advice.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
