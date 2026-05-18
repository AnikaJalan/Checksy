'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { Lightbulb, LayoutDashboard, Upload, ShieldAlert, Search, Bell, Settings, ClipboardList } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen bg-[#f9fafb] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-10">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
              <Lightbulb className="w-5 h-5 text-zinc-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-semibold text-lg leading-tight tracking-tight text-zinc-900">Checksy</span>
              <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400">AI Grading</span>
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
                    ? 'bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Profile Area */}
        <div className="p-4 border-t border-slate-100 space-y-4">
          <Link
            href="/settings/profile"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
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
              <span className="text-sm font-medium text-zinc-900 truncate">
                {user?.fullName || 'Teacher'}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-6 h-6 border-l-2 border-r-2 border-slate-200 opacity-20 mr-2" />
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search..." 
                className="pl-10 bg-slate-50 border-none shadow-none rounded-full h-10 text-sm focus-visible:ring-1 focus-visible:ring-slate-200"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-slate-200" />
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
