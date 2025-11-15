'use client'

// 1. Import useState
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, User, LogOut, Loader2, Menu } from 'lucide-react'
// import { Input } from '@/components/ui/input' // No longer needed
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/firebaseConfig'
import { signOut } from 'firebase/auth'
// import { ThemeToggle } from '@/components/ThemeToggle' // Removed
import { Chatbot } from './components/Chatbot'

import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"


const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'My Tasks', href: '/dashboard/tasks' },
  { name: 'Chat', href: '/dashboard/chat' },
  { name: 'Analytics', href: '/dashboard/analytics' },
  { name: 'Explore Projects', href: '/dashboard/explore' },
]

// 2. Define our color options
const colorOptions = [
  { name: 'Green', class: 'bg-green-50', hex: '#f0fdf4' },
  { name: 'Pink', class: 'bg-pink-50', hex: '#fdf2f8' },
  { name: 'Blue', class: 'bg-blue-50', hex: '#eff6ff' },
  { name: 'Lilac', class: 'bg-violet-50', hex: '#f5f3ff' },
  { name: 'Yellow', class: 'bg-yellow-50', hex: '#fefce8' },
  { name: 'White', class: 'bg-white', hex: '#ffffff' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, userProfile, loading } = useAuth()
  
  // 3. Add state for the background color
  const [bgColor, setBgColor] = useState('bg-green-50')


  useEffect(() => {
    if (!loading) {
      if (!currentUser) router.push('/login')
      else if (!userProfile?.onboardingComplete) router.push('/onboarding')
    }
  }, [currentUser, userProfile, loading, router])


  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out: ', error)
    }
  }


  // Loading State
  if (loading || !currentUser || !userProfile?.onboardingComplete) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // 4. Apply the state to the root div
  return (
    <div className={`h-screen w-screen flex overflow-hidden  text-black ${bgColor}`}>

      {/* --- MOBILE SIDEBAR --- */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50 bg-white border-2 border-black">
            <Menu size={24} />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-64 bg-white border-r-2 border-black">
          <aside className="flex flex-col h-fit">
            <div className="p-4 text-xl font-semibold border-b-2 border-black uppercase tracking-wider">
              CollabHub
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {sidebarLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={pathname === link.href ? "default" : "ghost"}
                    className={`w-full justify-start text-sm rounded-lg ${
                      pathname === link.href
                        ? 'bg-black text-white'
                        : 'text-black hover:bg-green-100'
                    }`}
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}

              {/* 5. Add Color Swatches (Mobile) */}
              <div className="pt-4 border-t border-gray-200 px-0">
                <span className="text-xs font-semibold uppercase text-gray-500 px-4">Theme</span>
                <div className="flex flex-wrap gap-2 pt-3 px-4">
                  {colorOptions.map(color => (
                    <button
                      key={color.name}
                      title={color.name}
                      onClick={() => setBgColor(color.class)}
                      className={`h-6 w-6 rounded-full border-2 ${bgColor === color.class ? 'border-black' : 'border-gray-300'}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            </nav>

            <div className="p-4 border-t-2 border-black">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full bg-white border-2 border-black text-black hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-2" /> Logout
              </Button>
            </div>
          </aside>
        </SheetContent>
      </Sheet>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 border-r-2 border-black bg-white flex-col fixed left-0 top-0 h-full">
        <div className="p-5 text-2xl font-semibold border-b-2 border-black text-black uppercase tracking-wider">
          CollabHub
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? "default" : "ghost"}
                className={`w-full justify-start text-sm rounded-lg ${
                  pathname === link.href
                    ? 'bg-black text-white font-medium'
                    : 'text-black hover:bg-green-100'
                }`}
              >
                {link.name}
              </Button>
            </Link>
          ))}

          {/* 6. Add Color Swatches (Desktop) */}
          <div className="pt-4 border-t border-gray-200 px-0">
            <span className="text-xs font-semibold uppercase text-gray-500 px-4">Theme</span>
            <div className="flex flex-wrap gap-2 pt-3 px-4">
              {colorOptions.map(color => (
                <button
                  key={color.name}
                  title={color.name}
                  onClick={() => setBgColor(color.class)}
                  className={`h-6 w-6 rounded-full border-2 ${bgColor === color.class ? 'border-black' : 'border-gray-300'}`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t-2 border-black">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-sm bg-white border-2 border-black text-black hover:bg-gray-100"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col md:ml-64 md:mr-80 h-full overflow-hidden">

        <header className="h-18 border-b-2 border-black flex items-center justify-between px-4 md:px-6 bg-white shrink-0 sticky top-0 z-10">

          {/* 7. Removed Search, added CollabHub title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl h-fit font-semibold uppercase tracking-wider text-black md:hidden">
              CollabHub
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications">
              <Button variant="outline" size="icon" className="bg-white border-2 border-black">
                <Bell size={20} />
              </Button>
            </Link>

            <Link href={`/dashboard/profile/${currentUser.uid}`}>
              <Button variant="outline" size="icon" className="bg-white border-2 border-black">
                <User size={20} />
              </Button>
            </Link>
          </div>
        </header>


        {/* 8. Apply background state to main content area */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 ${bgColor} bg-notebook-grid`}>
          {children}
        </main>

      </div>

      {/* --- RIGHT CHATBOT SIDEBAR --- */}
      <aside className="hidden md:flex w-80 border-l-2 border-black bg-white flex-col fixed right-0 top-0 h-full">
        <Chatbot />
      </aside>

      {/* --- MOBILE CHATBOT --- */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="md:hidden fixed bottom-5 right-5 z-50 rounded-full h-14 w-14 shadow-lg bg-black text-white hover:bg-gray-800 text-2xl"
          >
            💬
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="p-0 w-full bg-white border-l-2 border-black">
          <Chatbot />
        </SheetContent>
      </Sheet>

    </div>
  )
}