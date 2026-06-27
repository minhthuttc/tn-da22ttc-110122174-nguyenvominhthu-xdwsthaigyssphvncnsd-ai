import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-dark text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
          <ul className="space-y-3 text-sm inline-block text-left">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0"/> 
              <span>Phường 7, Nguyễn Thị Minh Khai, P. Trà Vinh</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary"/> 
              <a href="tel:0382286177" className="hover:text-primary transition">0382286177</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary"/> 
              <a href="mailto:nguyenthutv.220403@gmail.com" className="hover:text-primary transition">nguyenthutv.220403@gmail.com</a>
            </li>
          </ul>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} MINHTHUSIM. Xây dựng bởi 110122174_NGUYENVOMINHTHU.</p>
        </div>
      </div>
    </footer>
  );
}
