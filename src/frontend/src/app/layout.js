import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: '✨ MINHTHUSIM - Sim Số Đẹp Phong Thủy',
  description: 'Chuyên cung cấp sim số đẹp, sim phong thủy hợp mệnh. Tư vấn miễn phí - Giao sim tận nơi - Giá tốt nhất thị trường',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
