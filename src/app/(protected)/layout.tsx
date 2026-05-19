'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { Lightbulb, LayoutDashboard, Upload, ShieldAlert, Bell, Settings, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlobalSearch } from '@/components/global-search'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useUser()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Sessions', href: '/sessions', icon: ClipboardList },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Plagiarism', href: '/plagiarism', icon: ShieldAlert },
  ]

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#15264d] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f8fbff]/95 backdrop-blur border-r border-[#d7e2f0] flex flex-col fixed inset-y-0 left-0 z-10">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-[#e3ebf6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111827] rounded-xl flex items-center justify-center shadow-sm">
              <Lightbulb className="w-5 h-5 text-slate-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-semibold text-lg leading-tight tracking-tight text-[#14264d]">Checksy</span>
              <span className="text-[9px] uppercase tracking-widest font-semibold text-[#6e81aa]">AI Grading</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#12244a] shadow-sm border border-[#d4dfef]'
                    : 'text-[#6a7da4] hover:text-[#12244a] hover:bg-white/70'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-[#12244a]' : 'text-[#8aa0c3]'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Profile Area */}
        <div className="p-4 border-t border-[#e3ebf6] space-y-4">
          <Link
            href="/settings/profile"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[#6a7da4] hover:text-[#12244a] transition-colors"
          >
            <Settings className="w-4 h-4" />
            Profile Settings
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-2">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full border border-slate-200",
                }
              }}
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-[#12244a] truncate">
                {user?.fullName || 'Teacher'}
              </span>
              <span className="text-xs text-[#7488ad] truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-20 bg-[#f8fbff]/95 backdrop-blur border-b border-[#d7e2f0] flex items-center justify-between px-8 sticky top-0 z-50 isolate">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-6 h-6 border-l-2 border-r-2 border-[#cfdbed] opacity-35 mr-2" />
            <GlobalSearch />
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="text-[#8ba1c3] hover:text-[#4e678f] rounded-full hover:bg-white/80">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-[#d4dfef]" />
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-full border shadow-sm",
                }
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
