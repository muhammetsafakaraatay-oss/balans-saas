import Sidebar from '../components/Sidebar'
import { ThemeProvider } from '../components/ThemeProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
    <div className="flex min-h-screen bg-[#0f0f0f]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
    </ThemeProvider>
  )
}
