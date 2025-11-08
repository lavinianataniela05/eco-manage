'use client'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/mainpage/Sidebar'
import Chatbot from '@/components/Chatbot' // Perbaiki path ini
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Define routes that should NOT show sidebar
  const noSidebarRoutes = ['/', '/login', '/register', '/logout']
  const shouldShowSidebar = !noSidebarRoutes.includes(pathname)

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          {shouldShowSidebar && (
            <div className="w-64 fixed left-0 top-0 h-full border-r bg-white shadow-sm z-10">
              <Sidebar />
            </div>
          )}
          
          <main className={`flex-1 ${shouldShowSidebar ? 'ml-64' : ''}`}>
            <div className="p-0">
              {children}
            </div>
          </main>

          {/* Tambahkan Chatbot di sini */}
          <Chatbot />
        </div>
      </body>
    </html>
  )
}