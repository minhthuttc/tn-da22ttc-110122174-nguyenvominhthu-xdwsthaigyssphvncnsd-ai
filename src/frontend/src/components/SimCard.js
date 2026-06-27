"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, ChevronRight, X, CreditCard, User, Phone, MapPin, Info } from "lucide-react";
import axios from "axios";
import QRCode from "qrcode";

export default function SimCard({ sim }) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // Rendered QR image data URL
  const [qrCodeData, setQrCodeData] = useState(""); // Raw QR string from PayOS
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [purchaseForm, setPurchaseForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "bank_transfer"
  });
  const [useCustomInfo, setUseCustomInfo] = useState({
    name: false,
    phone: false,
    address: false
  });
  const [loading, setLoading] = useState(false);

  // Debug useEffect - Log mỗi khi state thay đổi
  useEffect(() => {
    console.log('\n📊 === STATE CHANGED ===');
    console.log('currentOrderId:', currentOrderId);
    console.log('paymentStatus:', paymentStatus);
    console.log('showQRModal:', showQRModal);
    console.log('showSuccessModal:', showSuccessModal);
    console.log('======================\n');
    
    // Kiểm tra điều kiện để mở Success Modal
    if (paymentStatus === 'PAID' && !showQRModal && showSuccessModal) {
      console.log('🎉 SUCCESS MODAL SHOULD BE VISIBLE NOW!');
      console.log('   - paymentStatus = PAID ✓');
      console.log('   - showQRModal = false ✓');
      console.log('   - showSuccessModal = true ✓');
    }
  }, [currentOrderId, paymentStatus, showQRModal, showSuccessModal]);

  // Polling để kiểm tra trạng thái thanh toán TỰ ĐỘNG - DEBUG VERSION
  useEffect(() => {
    let pollingInterval;
    
    console.log('=== POLLING USEEFFECT TRIGGERED ===');
    console.log('currentOrderId:', currentOrderId);
    console.log('paymentStatus:', paymentStatus);
    console.log('showQRModal:', showQRModal);
    
    if (currentOrderId && paymentStatus === 'PENDING' && showQRModal) {
      console.log('✅ POLLING CONDITIONS MET - STARTING POLLING');
      console.log('🔄 POLLING STARTED FOR ORDER:', currentOrderId);
      console.log('⏰ Tự động kiểm tra mỗi 3 giây...');
      
      pollingInterval = setInterval(async () => {
        console.log('\n=== POLLING TICK ===');
        console.log('⏰ CHECK PAYMENT STATUS AT:', new Date().toLocaleTimeString());
        console.log('📋 ORDER ID:', currentOrderId);
        
        try {
          const apiUrl = `http://localhost:5000/api/order/payment-status/${currentOrderId}`;
          console.log('🌐 Calling API:', apiUrl);
          
          const response = await axios.get(apiUrl);
          
          console.log('📥 API RESPONSE RECEIVED:');
          console.log('response.data:', JSON.stringify(response.data, null, 2));
          
          if (response.data.success) {
            const { paymentStatus: status } = response.data.data;
            console.log('📊 PAYMENT STATUS:', status);
            
            if (status === 'PAID') {
              console.log('\n🎉🎉🎉 PAID DETECTED!!! 🎉🎉🎉');
              console.log('✅ Phát hiện thanh toán thành công!');
              console.log('🔄 Đang thực hiện các actions...');
              console.log('');
              
              console.log('BEFORE setState:');
              console.log('  - paymentStatus (current):', paymentStatus);
              console.log('  - showQRModal (current):', showQRModal);
              console.log('  - showSuccessModal (current):', showSuccessModal);
              console.log('');
              
              console.log('1️⃣ Calling setPaymentStatus("PAID")...');
              setPaymentStatus('PAID');
              
              console.log('2️⃣ CLOSING QR MODAL - Calling setShowQRModal(false)...');
              setShowQRModal(false);
              
              console.log('3️⃣ OPENING SUCCESS MODAL - Calling setShowSuccessModal(true)...');
              setShowSuccessModal(true);
              
              console.log('4️⃣ Clearing interval...');
              clearInterval(pollingInterval);
              
              console.log('5️⃣ Showing alert...');
              alert('✅ Thanh toán thành công! Đơn hàng đã được xác nhận.');
              
              console.log('');
              console.log('✅ ALL SETSTATE CALLS COMPLETED');
              console.log('⏳ Waiting for React to re-render...');
              console.log('   Next, check STATE CHANGED log to confirm state updates');
            } else {
              console.log('⏳ Status is still:', status, '- Continue polling...');
            }
          } else {
            console.warn('⚠️ API response.data.success is false:', response.data);
          }
        } catch (error) {
          console.error('❌ LỖI KHI KIỂM TRA TRẠNG THÁI:', error);
          console.error('Error details:', error.response?.data || error.message);
        }
      }, 3000); // Kiểm tra mỗi 3 giây
    } else {
      console.log('❌ POLLING CONDITIONS NOT MET:');
      if (!currentOrderId) console.log('  - currentOrderId is null/undefined');
      if (paymentStatus !== 'PENDING') console.log('  - paymentStatus is not PENDING:', paymentStatus);
      if (!showQRModal) console.log('  - showQRModal is false');
    }

    return () => {
      if (pollingInterval) {
        console.log('🛑 CLEANUP - DỪNG POLLING');
        clearInterval(pollingInterval);
      }
    };
  }, [currentOrderId, paymentStatus, showQRModal]);

  // Extract data from backend response
  const { 
    sim_number, 
    network, 
    price, 
    category, 
    description,
    status,
    suitabilityScore, 
    explainableAI,
    fengShuiPoint,
    interestPoint
  } = sim;

  // Generate detailed description for modal
  const getDetailedDescription = () => {
    const simStr = sim_number || '';
    const cleanStr = simStr.replace(/\D/g, ''); // Remove non-digits
    let desc = [];
    
    // Intro with specific number
    desc.push(`📞 Số sim ${formatPhone(sim_number)} thuộc nhà mạng ${network}`);
    
    // Analyze number patterns in detail
    const patterns = [];
    const features = [];
    
    // Check for quad repeating (4+ same digits)
    const quadMatch = cleanStr.match(/(\d)\1{3,}/);
    if (quadMatch) {
      const digit = quadMatch[1];
      const count = quadMatch[0].length;
      patterns.push(`có ${count} số ${digit} liên tiếp - cực kỳ hiếm và đẹp mắt`);
      features.push('Số lặp quý hiếm');
    }
    // Check for triple repeating
    else if (/(\d)\1{2}/.test(cleanStr)) {
      const tripleMatch = cleanStr.match(/(\d)\1{2}/);
      patterns.push(`chứa bộ ba số ${tripleMatch[1]} (${tripleMatch[0]}) - dễ nhớ, ấn tượng`);
      features.push('Số đôi đẹp');
    }
    
    // Check for ascending sequences
    const ascendingPatterns = ['0123', '1234', '2345', '3456', '4567', '5678', '6789'];
    for (const pattern of ascendingPatterns) {
      if (cleanStr.includes(pattern)) {
        patterns.push(`có dãy số tăng dần ${pattern.split('').join('-')} - biểu tượng của sự phát triển, thăng tiến trong sự nghiệp`);
        features.push('Dãy tăng dần');
        break;
      }
    }
    
    // Check for descending sequences
    const descendingPatterns = ['9876', '8765', '7654', '6543', '5432', '4321', '3210'];
    for (const pattern of descendingPatterns) {
      if (cleanStr.includes(pattern)) {
        patterns.push(`có dãy số giảm dần ${pattern.split('').join('-')} - thu hút tài lộc, vượng khí về nhà`);
        features.push('Dãy giảm dần');
        break;
      }
    }
    
    // Check for mirror/palindrome
    if (cleanStr.length >= 4) {
      const last4 = cleanStr.slice(-4);
      if (last4 === last4.split('').reverse().join('')) {
        patterns.push(`có đuôi đối xứng ${last4.split('').join('-')} - hài hòa, cân bằng`);
        features.push('Số đối xứng');
      }
    }
    
    // Lucky numbers analysis
    const luckyDetails = [];
    const count6 = (cleanStr.match(/6/g) || []).length;
    const count8 = (cleanStr.match(/8/g) || []).length;
    const count9 = (cleanStr.match(/9/g) || []).length;
    
    if (count6 >= 2) {
      luckyDetails.push(`${count6} số 6 (Lục Lộc - may mắn, thuận lợi)`);
      features.push('Số 6 phong thủy');
    }
    if (count8 >= 2) {
      luckyDetails.push(`${count8} số 8 (Phát Tài - giàu có, thịnh vượng)`);
      features.push('Số 8 phát tài');
    }
    if (count9 >= 2) {
      luckyDetails.push(`${count9} số 9 (Cửu Quý - trường tồn, bền vững)`);
      features.push('Số 9 cửu quý');
    }
    
    if (luckyDetails.length > 0) {
      patterns.push(`chứa ${luckyDetails.join(', ')} - những con số vàng trong phong thủy Á Đông`);
    }
    
    // Check for year patterns (birth year)
    const yearMatch = cleanStr.match(/(19\d{2}|20\d{2})/);
    if (yearMatch) {
      patterns.push(`có năm sinh ${yearMatch[0]} - đặc biệt ý nghĩa cho người sinh năm này`);
      features.push(`Năm sinh ${yearMatch[0]}`);
    }
    
    // Build main description
    if (patterns.length > 0) {
      desc.push(`\n\n🌟 Đặc điểm nổi bật:\n${patterns.map((p, i) => `${i + 1}. Sim ${p}`).join('\n')}`);
    } else {
      desc.push('\n\n🌟 Đặc điểm:\nSim có số đẹp, dễ nhớ, phù hợp cho nhiều mục đích sử dụng.');
    }
    
    // Category benefits
    if (category) {
      desc.push(`\n\n📱 Phân loại: ${category}`);
      if (category.toLowerCase().includes('thần tài') || category.toLowerCase().includes('lộc phát')) {
        desc.push('→ Sim phong thủy cao cấp, được các chuyên gia phong thủy khuyên dùng cho người làm kinh doanh, mang lại tài lộc và may mắn.');
      } else if (category.toLowerCase().includes('năm sinh')) {
        desc.push('→ Sim mang năm sinh, tạo sự kết nối đặc biệt với chủ nhân, tăng cường vận may và sự thuận lợi.');
      }
    }
    
    // Price positioning
    desc.push(`\n\n💰 Giá bán: ${formatPrice(price)}`);
    if (price < 1000000) {
      desc.push('→ Mức giá cực kỳ hợp lý, phù hợp với mọi đối tượng. Đây là cơ hội tốt để sở hữu sim đẹp với chi phí thấp.');
    } else if (price < 2000000) {
      desc.push('→ Mức giá tốt, cân đối giữa chất lượng số và giá trị. Phù hợp cho người muốn sim đẹp với ngân sách vừa phải.');
    } else if (price < 5000000) {
      desc.push('→ Mức giá trung cao, xứng đáng với độ đẹp và ý nghĩa của sim. Thích hợp cho người có nhu cầu sim chất lượng.');
    } else {
      desc.push('→ Sim cao cấp, thể hiện đẳng cấp và sự khác biệt. Dành cho những người thành đạt, muốn khẳng định vị thế.');
    }
    
    // Usage recommendations based on actual features
    desc.push('\n\n✨ Phù hợp cho:');
    const useCases = [];
    
    if (features.includes('Số 8 phát tài') || features.includes('Số 6 phong thủy') || category?.toLowerCase().includes('thần tài')) {
      useCases.push('🏢 Doanh nhân, chủ doanh nghiệp - mang lại tài lộc');
      useCases.push('💼 Người làm kinh doanh, buôn bán - thu hút khách hàng');
    }
    
    if (features.includes('Dãy tăng dần')) {
      useCases.push('📈 Người muốn thăng tiến trong sự nghiệp');
    }
    
    if (yearMatch) {
      useCases.push(`🎂 Người sinh năm ${yearMatch[0]} - sim mang năm sinh`);
      useCases.push('🎁 Quà tặng sinh nhật ý nghĩa');
    }
    
    if (features.includes('Số lặp quý hiếm') || features.includes('Số đối xứng')) {
      useCases.push('⭐ Người yêu thích sim độc đáo, khác biệt');
    }
    
    useCases.push('📱 Sử dụng cá nhân hàng ngày');
    useCases.push('💝 Làm quà tặng cho người thân, đối tác');
    
    desc.push(useCases.join('\n'));
    
    // Network benefits
    desc.push(`\n\n📡 Ưu điểm nhà mạng ${network}:`);
    const networkBenefits = {
      'Viettel': '• Phủ sóng rộng nhất Việt Nam\n• Tốc độ 4G/5G ổn định\n• Nhiều gói cước ưu đãi',
      'Vinaphone': '• Chất lượng cuộc gọi tốt\n• Mạng lưới ổn định\n• Dịch vụ khách hàng chuyên nghiệp',
      'Mobifone': '• Thương hiệu lâu đời, uy tín\n• Chất lượng đường truyền tốt\n• Gói cước đa dạng'
    };
    desc.push(networkBenefits[network] || '• Chất lượng mạng ổn định\n• Dịch vụ chăm sóc khách hàng tốt');
    
    // Closing
    desc.push('\n\n🎁 Cam kết:\n• Sim chính chủ, đầy đủ giấy tờ\n• Hỗ trợ đổi sim miễn phí nếu có vấn đề\n• Giao sim tận nơi, thanh toán khi nhận hàng');
    
    return desc.join('');
  };

  // Generate short description based on sim characteristics
  const getShortDescription = () => {
    const simStr = sim_number || '';
    const parts = [];
    
    // Check for repeating patterns
    if (/(\d)\1{2,}/.test(simStr)) {
      parts.push('Số có dãy lặp đẹp');
    }
    
    // Check for ascending/descending
    if (/(?:0123|1234|2345|3456|4567|5678|6789)/.test(simStr)) {
      parts.push('dãy số tăng dần');
    }
    
    // Check for lucky numbers
    if (/[68]{2,}/.test(simStr)) {
      parts.push('chứa số may mắn 6-8');
    }
    
    // Check category
    if (category?.includes('thần tài') || category?.includes('lộc phát')) {
      parts.push('sim phong thủy');
    }
    
    // Check price range
    if (price < 1000000) {
      parts.push('giá tốt');
    } else if (price > 3000000) {
      parts.push('sim cao cấp');
    }
    
    // Build description
    if (parts.length > 0) {
      return `${parts.join(', ')}. Phù hợp cho mọi nhu cầu sử dụng, dễ nhớ và tiện lợi.`;
    }
    
    return 'Sim đẹp, giá tốt, phù hợp cho mọi nhu cầu sử dụng. Số dễ nhớ, tiện lợi cho việc liên lạc hàng ngày.';
  };

  // Format phone number (e.g. 098 123 4567)
  const formatPhone = (num) => {
    return num?.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3") || num;
  };

  // Format price
  const formatPrice = (p) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };

  // Determine network color
  const getNetworkBg = (net) => {
    if (net?.toLowerCase() === 'viettel') return 'bg-red-500';
    if (net?.toLowerCase() === 'vinaphone') return 'bg-blue-500';
    if (net?.toLowerCase() === 'mobifone') return 'bg-red-600';
    return 'bg-gray-500';
  };

  const handleOpenModal = () => {
    // Lấy thông tin user từ localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Vui lòng đăng nhập để mua sim!");
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(userData);
    // Tự động điền tên, số điện thoại và địa chỉ (nếu có)
    setPurchaseForm({
      fullName: user.name,
      phone: user.phone || "",
      address: user.address || "",
      paymentMethod: "bank_transfer"
    });
    setShowPurchaseModal(true);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Vui lòng đăng nhập để mua sim!");
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(userData);
    
    // Nếu chọn chuyển khoản, hiển thị QR code
    if (purchaseForm.paymentMethod === 'bank_transfer') {
      console.log('\n=== BẮT ĐẦU QUY TRÌNH MUA SIM - CHUYỂN KHOẢN ===');
      
      // Validate form trước
      if (!purchaseForm.phone || !purchaseForm.address) {
        alert("Vui lòng điền đầy đủ số điện thoại và địa chỉ!");
        return;
      }
      console.log('✅ Validation passed');

      // Tạo đơn hàng TRƯỚC KHI hiển thị QR
      setLoading(true);
      console.log('📤 Đang gọi API tạo đơn hàng...');
      
      try {
        const purchaseData = {
          user_id: user.id,
          user_name: user.name,
          sim_number,
          network,
          price,
          category,
          customer_name: purchaseForm.fullName,
          customer_phone: purchaseForm.phone,
          customer_address: purchaseForm.address,
          payment_method: 'bank_transfer'
        };
        
        console.log('📋 PURCHASE REQUEST DATA:');
        console.log(JSON.stringify(purchaseData, null, 2));
        console.log('');
        
        console.log('🌐 Calling API: POST http://localhost:5000/api/purchase');
        const response = await axios.post("http://localhost:5000/api/purchase", purchaseData);
        
        console.log('📥 API Response:', response.data);

        // Lưu orderId và tạo PayOS payment link
        if (response.data.orderId) {
          const newOrderId = response.data.orderId;
          
          console.log('✅ ORDER CREATED');
          console.log('🆔 ORDER ID:', newOrderId);
          
          // Create PayOS payment link
          console.log('🔷 Creating PayOS payment link...');
          try {
            const paymentResponse = await axios.post("http://localhost:5000/api/payment/create", {
              orderId: newOrderId
            });
            
            console.log('✅ PayOS payment link created:');
            console.log('   - checkoutUrl:', paymentResponse.data.checkoutUrl);
            console.log('   - qrCode:', paymentResponse.data.qrCode);
            console.log('   - paymentLinkId:', paymentResponse.data.paymentLinkId);
            console.log('Full PayOS response:', JSON.stringify(paymentResponse.data, null, 2));
            
            // Save state
            setCurrentOrderId(newOrderId);
            setPaymentStatus('PENDING');
            
            // Set PayOS checkout URL
            setCheckoutUrl(paymentResponse.data.checkoutUrl);
            
            // Generate QR code image from PayOS qrCode data string
            const qrDataString = paymentResponse.data.qrCode;
            console.log('🔷 Generating QR image from PayOS data string...');
            console.log('   - QR data length:', qrDataString?.length);
            
            if (qrDataString) {
              try {
                // Generate QR code image as data URL
                const qrImageUrl = await QRCode.toDataURL(qrDataString, {
                  width: 400,
                  margin: 2,
                  color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                  }
                });
                setQrCodeUrl(qrImageUrl);
                setQrCodeData(qrDataString);
                console.log('✅ QR image generated successfully');
                console.log('   - Image URL starts with:', qrImageUrl.substring(0, 30));
              } catch (qrError) {
                console.error('❌ Failed to generate QR image:', qrError);
                setQrCodeUrl(''); // Will show checkout button instead
              }
            }
            
            console.log('💾 Saved to state:');
            console.log('   - qrCodeUrl:', qrCodeUrl ? 'Generated' : 'Failed');
            console.log('   - checkoutUrl:', paymentResponse.data.checkoutUrl);
            console.log('   - Type of qrCode:', typeof paymentResponse.data.qrCode);
            console.log('   - Type of checkoutUrl:', typeof paymentResponse.data.checkoutUrl);
            
            // Open QR Modal
            setShowQRModal(true);
            setShowPurchaseModal(false);
            
            console.log('✅ QR Modal opened with PayOS payment link');
            
          } catch (paymentError) {
            console.error('❌ Failed to create PayOS payment:', paymentError);
            alert('Không thể tạo link thanh toán. Vui lòng thử lại!');
          }
          
        } else {
          console.error('⚠️ WARNING: response.data.orderId is missing!');
          console.error('Full response:', JSON.stringify(response.data, null, 2));
        }

        console.log('=== QUY TRÌNH TẠO ĐƠN HOÀN TẤT ===\n');
      } catch (error) {
        console.error('\n❌❌❌ PURCHASE ERROR ❌❌❌');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        console.error('');
        
        const errorMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra. Vui lòng thử lại!";
        alert(`❌ LỖI MUA SIM:\n\n${errorMsg}\n\nChi tiết: ${JSON.stringify(error.response?.data, null, 2)}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Nếu chọn COD, xử lý bình thường
    setLoading(true);

    try {
      // Lưu lịch sử mua hàng
      const response = await axios.post("http://localhost:5000/api/purchase", {
        user_id: user.id,
        user_name: user.name,
        sim_number,
        network,
        price,
        category,
        customer_name: purchaseForm.fullName,
        customer_phone: purchaseForm.phone,
        customer_address: purchaseForm.address,
        payment_method: purchaseForm.paymentMethod
      });

      // Lưu orderId
      if (response.data.orderId) {
        setCurrentOrderId(response.data.orderId);
      }

      // Đóng modal purchase và hiển thị modal thành công
      setShowPurchaseModal(false);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra. Vui lòng thử lại!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Đã không cần handleConfirmTransfer nữa vì đơn hàng được tạo ngay khi hiển thị QR

  return (
    <>
      <div className="group bg-white dark:bg-dark-lighter rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
      
      {/* Network Badge & Match Score Badge */}
      <div className="flex justify-between items-start mb-6 z-10 w-full">
        {status === 'Đã bán' ? (
          <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            ĐÃ ĐẶT
          </span>
        ) : (
          <span className={`${getNetworkBg(network)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
            {network}
          </span>
        )}
        
        <div className="flex bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-primary px-3 py-1 rounded-full font-bold items-center gap-1 shadow-sm border border-amber-100 dark:border-amber-900/50">
          <Sparkles className="w-4 h-4" />
          <span>S: {suitabilityScore}</span>
        </div>
      </div>

      {/* Main SIM Number */}
      <div className="text-center my-4 z-10">
        <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent tracking-[0.1em] whitespace-nowrap drop-shadow-sm">
          {formatPhone(sim_number)}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-sm">{category}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6 z-10">
        <p className="text-xl font-bold text-red-500 dark:text-red-400">
          {formatPrice(price)}
        </p>
      </div>

      <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-4 z-10"></div>

      {/* Description block */}
      <div className="flex-grow z-10 min-h-[100px]">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
           Chi tiết về sim:
        </h4>
        {status === 'Đã bán' ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              ⚠️ Sim này đã có người mua
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Vui lòng chọn sim khác
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {getShortDescription()}
            </p>
            <div
              role="button"
              tabIndex={0}
              onClick={async () => {
                setShowDetailModal(true);
                try {
                  const simId = sim.id || sim.ma_sim;
                  if (simId) {
                    await axios.put(`http://localhost:5000/api/sims/${simId}/increment-search`);
                  }
                } catch (err) {
                  // silent fail
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowDetailModal(true);
                }
              }}
              className="mt-3 text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-4 h-4" />
              Xem chi tiết
            </div>
          </>
        )}
      </div>

      {/* CTA Button */}
      {status === 'Đã bán' ? (
        (() => {
          const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          const isAdmin = userData && JSON.parse(userData).role === 'admin';
          if (isAdmin) {
            return (
              <button 
                onClick={async () => {
                  if (!confirm(`Hủy đơn hàng sim ${sim_number}? Sim sẽ trả về kho.`)) return;
                  try {
                    await axios.put('http://localhost:5000/api/admin/purchases/cancel-by-sim', {
                      sim_number
                    });
                    alert('Đã hủy đơn hàng và trả sim về kho!');
                    window.location.reload();
                  } catch (err) {
                    alert(err.response?.data?.message || 'Có lỗi xảy ra!');
                  }
                }}
                className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 z-10 shadow-md hover:shadow-lg"
              >
                Hủy đơn
              </button>
            );
          }
          return (
            <button 
              disabled
              className="w-full mt-6 bg-gray-400 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 z-10 cursor-not-allowed opacity-60"
            >
              Đã có người đặt
            </button>
          );
        })()
      ) : (
        <button 
          onClick={handleOpenModal}
          className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 z-10 shadow-md hover:shadow-lg"
        >
          Mua Ngay <ChevronRight className="w-4 h-4"/>
        </button>
      )}

      {/* Subtle background decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
    </div>

    {/* Purchase Modal */}
    {showPurchaseModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-lighter rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold dark:text-white">Thông tin mua sim</h2>
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Sim Info */}
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`${getNetworkBg(network)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                  {network}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
              </div>
              <h3 className="text-3xl font-bold text-center mb-2 tracking-wider">
                {formatPhone(sim_number)}
              </h3>
              <p className="text-3xl font-bold text-red-500 text-center">
                {formatPrice(price)}
              </p>
            </div>

            {/* Purchase Form */}
            <form onSubmit={handlePurchase} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                  <User className="w-4 h-4" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={purchaseForm.fullName}
                  onChange={(e) => setPurchaseForm({...purchaseForm, fullName: e.target.value})}
                  disabled={!useCustomInfo.name}
                  required
                  className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="Nhập họ và tên"
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomInfo.name}
                    onChange={(e) => {
                      setUseCustomInfo({...useCustomInfo, name: e.target.checked});
                      if (!e.target.checked) {
                        // Reset về thông tin mặc định
                        const userData = JSON.parse(localStorage.getItem("user") || "{}");
                        setPurchaseForm({...purchaseForm, fullName: userData.name || ""});
                      }
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  Sử dụng tên người nhận khác
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                  <Phone className="w-4 h-4" />
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  value={purchaseForm.phone}
                  onChange={(e) => setPurchaseForm({...purchaseForm, phone: e.target.value})}
                  disabled={!useCustomInfo.phone}
                  required
                  className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="Nhập số điện thoại"
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomInfo.phone}
                    onChange={(e) => {
                      setUseCustomInfo({...useCustomInfo, phone: e.target.checked});
                      if (!e.target.checked) {
                        const userData = JSON.parse(localStorage.getItem("user") || "{}");
                        setPurchaseForm({...purchaseForm, phone: userData.phone || ""});
                      }
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  Sử dụng số điện thoại khác
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ nhận sim
                </label>
                <textarea
                  value={purchaseForm.address}
                  onChange={(e) => setPurchaseForm({...purchaseForm, address: e.target.value})}
                  disabled={!useCustomInfo.address}
                  required
                  rows="3"
                  className="w-full bg-white dark:bg-dark border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed resize-none"
                  placeholder="Nhập địa chỉ nhận sim"
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomInfo.address}
                    onChange={(e) => {
                      setUseCustomInfo({...useCustomInfo, address: e.target.checked});
                      if (!e.target.checked) {
                        const userData = JSON.parse(localStorage.getItem("user") || "{}");
                        setPurchaseForm({...purchaseForm, address: userData.address || ""});
                      }
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  Sử dụng địa chỉ khác
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 dark:text-gray-200">
                  <CreditCard className="w-4 h-4" />
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPurchaseForm({...purchaseForm, paymentMethod: 'bank_transfer'})}
                    className={`p-4 rounded-lg border-2 transition ${
                      purchaseForm.paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Chuyển khoản</div>
                    <div className="text-xs mt-1">Ngân hàng</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchaseForm({...purchaseForm, paymentMethod: 'cod'})}
                    className={`p-4 rounded-lg border-2 transition ${
                      purchaseForm.paymentMethod === 'cod'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-semibold">COD</div>
                    <div className="text-xs mt-1">Thanh toán khi nhận</div>
                  </button>
                </div>
              </div>

              {purchaseForm.paymentMethod === 'bank_transfer' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 dark:text-white">Thông tin chuyển khoản:</h4>
                  <div className="space-y-1 text-sm dark:text-gray-300">
                    <p><strong>Ngân hàng:</strong> MB Bank</p>
                    <p><strong>Số tài khoản:</strong> 0382286177</p>
                    <p><strong>Chủ tài khoản:</strong> NGUYEN VO MINH THU</p>
                    <p><strong>Nội dung:</strong> MUA SỐ: {sim_number}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận mua"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* Detail Modal */}
    {showDetailModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-lighter rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold dark:text-white">Chi tiết sim {formatPhone(sim_number)}</h2>
            <button
              onClick={() => setShowDetailModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            >
              <X className="w-6 h-6 dark:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Sim Info */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Số sim</p>
                  <p className="text-3xl font-bold text-primary">{formatPhone(sim_number)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Giá bán</p>
                  <p className="text-2xl font-bold text-red-500">{formatPrice(price)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Nhà mạng</p>
                  <p className="font-semibold dark:text-white">{network}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Loại sim</p>
                  <p className="font-semibold dark:text-white">{category}</p>
                </div>
              </div>
              {suitabilityScore && (
                <div className="mt-4 flex items-center gap-2 bg-white dark:bg-dark rounded-lg p-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm dark:text-gray-300">Điểm phù hợp: <span className="font-bold text-primary">{suitabilityScore}</span></span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold dark:text-white mb-3">Mô tả chi tiết</h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {description || getDetailedDescription()}
              </div>
            </div>

            {/* Explainable AI */}
            {explainableAI && explainableAI.length > 0 && (
              <div>
                <h3 className="text-lg font-bold dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Phân tích AI
                </h3>
                <ul className="space-y-3">
                  {explainableAI.map((reason, index) => (
                    <li key={index} className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-dark-lighter border-t border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={() => {
                setShowDetailModal(false);
                if (status !== 'Đã bán') {
                  handleOpenModal();
                }
              }}
              disabled={status === 'Đã bán'}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'Đã bán' ? 'Sim đã được đặt' : 'Mua ngay'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* QR Code Modal */}
    {showQRModal && (() => {
      console.log('🔵 RENDERING QR MODAL - showQRModal =', showQRModal);
      return true;
    })() && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-lighter rounded-2xl max-w-lg w-full shadow-2xl max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-amber-500 text-white p-4 rounded-t-2xl">
            <h2 className="text-xl font-bold text-center">Quét mã QR để thanh toán</h2>
            <p className="text-center text-xs mt-1 opacity-90">Sử dụng app ngân hàng để quét mã PayOS</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* PayOS QR Code */}
            <div className="bg-white border-4 border-primary/20 rounded-xl p-2 flex flex-col justify-center items-center min-h-[320px]">
              {qrCodeUrl ? (
                <>
                  <img 
                    src={qrCodeUrl} 
                    alt="PayOS QR Code thanh toán" 
                    className="w-80 h-80 object-contain"
                    onLoad={() => console.log('✅ QR image loaded successfully')}
                    onError={(e) => {
                      console.error('❌ QR image failed to load:', e);
                      console.error('QR URL:', qrCodeUrl);
                      e.target.style.display = 'none';
                      const errorDiv = e.target.nextElementSibling;
                      if (errorDiv) errorDiv.style.display = 'block';
                    }}
                  />
                  <div style={{display: 'none'}} className="text-center p-4">
                    <p className="text-red-500 mb-4">❌ Không thể hiển thị QR code</p>
                    <p className="text-sm text-gray-600 mb-4">Vui lòng sử dụng link thanh toán bên dưới</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm font-medium">Đang tạo mã QR PayOS...</p>
                  <p className="text-xs text-gray-400 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
              )}
            </div>
            
            {/* Checkout URL Button - Always show as alternative */}
            {checkoutUrl && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {qrCodeUrl ? 'Hoặc thanh toán qua link:' : 'Thanh toán qua link:'}
                </p>
                <a 
                  href={checkoutUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                >
                  <CreditCard className="w-5 h-5" />
                  Mở trang thanh toán PayOS
                </a>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <h4 className="font-bold text-center dark:text-white mb-2 text-sm">Thông tin thanh toán</h4>
              <div className="space-y-1.5 text-xs dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Số sim:</span>
                  <span className="font-semibold">{sim_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Số tiền:</span>
                  <span className="font-bold text-red-500 text-sm">{formatPrice(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phương thức:</span>
                  <span className="font-semibold">PayOS</span>
                </div>
              </div>
            </div>

            {/* Instructions - COMPACT */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <h4 className="font-semibold dark:text-white mb-1.5 flex items-center gap-1.5 text-sm">
                <Info className="w-4 h-4 text-amber-600" />
                Hướng dẫn
              </h4>
              <ol className="text-xs space-y-0.5 dark:text-gray-300 list-decimal list-inside">
                <li>Mở app ngân hàng hỗ trợ PayOS</li>
                <li>Chọn tính năng "Quét mã QR"</li>
                <li>Quét mã QR PayOS phía trên</li>
                <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                <li>Hệ thống PayOS sẽ tự động cập nhật ngay lập tức</li>
              </ol>
            </div>

            {/* Auto-check indicator */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
              <div className="animate-pulse flex items-center justify-center">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                Hệ thống PayOS đang tự động kiểm tra thanh toán mỗi 3 giây...
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setShowPurchaseModal(true);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
              >
                Quay lại
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold transition text-sm"
              >
                Đóng
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
              💡 Hệ thống sẽ tự động xác nhận sau khi bạn chuyển khoản thành công
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Success Modal */}
    {showSuccessModal && (() => {
      console.log('🟢 RENDERING SUCCESS MODAL - showSuccessModal =', showSuccessModal);
      return true;
    })() && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-lighter rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Success Icon - Fixed Header */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 text-center flex-shrink-0">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold">Đặt mua thành công!</h2>
            <p className="text-green-100 mt-1 text-sm">Đơn hàng của bạn đã được ghi nhận</p>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <h3 className="font-bold text-center dark:text-white mb-3 text-base">📋 Thông tin đơn hàng</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Số sim:</span>
                  <span className="font-bold text-primary text-base">{formatPhone(sim_number)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nhà mạng:</span>
                  <span className="font-semibold dark:text-white">{network}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Số tiền:</span>
                  <span className="font-bold text-red-500 text-base">{formatPrice(price)}</span>
                </div>
                <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Khách hàng:</span>
                  <span className="font-semibold dark:text-white">{purchaseForm.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Số điện thoại:</span>
                  <span className="font-semibold dark:text-white">{purchaseForm.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold dark:text-white mb-2 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                {purchaseForm.paymentMethod === 'bank_transfer' ? 'Thông tin chuyển khoản' : 'Phương thức thanh toán'}
              </h4>
              {purchaseForm.paymentMethod === 'bank_transfer' ? (
                <div className="space-y-1.5 text-sm dark:text-gray-300">
                  <p><strong>Ngân hàng:</strong> Vietcombank</p>
                  <p><strong>STK:</strong> 1025311193</p>
                  <p><strong>Chủ TK:</strong> NGUYEN VO MINH THU</p>
                  <p><strong>Nội dung:</strong> MUASO{sim_number.replace(/\s/g, '')}</p>
                </div>
              ) : (
                <div className="space-y-1.5 text-sm dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span><strong>COD</strong> - Thanh toán khi nhận hàng</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Bạn sẽ thanh toán tiền mặt cho shipper khi nhận sim. Vui lòng chuẩn bị số tiền <strong className="text-red-500">{formatPrice(price)}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 text-sm flex items-center gap-1">
                ✅ Các bước tiếp theo
              </h4>
              {purchaseForm.paymentMethod === 'bank_transfer' ? (
                <ol className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li>Chúng tôi sẽ kiểm tra giao dịch trong vòng 1-2 giờ</li>
                  <li>Xác nhận qua số điện thoại: <span className="font-semibold">{purchaseForm.phone}</span></li>
                  <li>Giao sim tận nơi trong 24-48h</li>
                </ol>
              ) : (
                <ol className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li>Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 30 phút</li>
                  <li>Shipper giao sim đến địa chỉ: <span className="font-semibold">{purchaseForm.address}</span></li>
                  <li>Bạn kiểm tra sim và thanh toán tiền mặt cho shipper</li>
                </ol>
              )}
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📞 Hotline hỗ trợ: <span className="font-bold text-primary">0382286177</span>
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark flex-shrink-0">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setPurchaseForm({
                  fullName: "",
                  phone: "",
                  address: "",
                  paymentMethod: "bank_transfer"
                });
                window.location.reload();
              }}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition shadow-lg"
            >
              Hoàn tất
            </button>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
              Cảm ơn bạn đã tin tưởng <span className="font-bold text-primary">MINH THU SIM</span>! 🙏
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
