'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Search, User, LogOut, Loader2, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/firebaseConfig'
import { signOut } from 'firebase/auth'
import { ThemeToggle } from '@/components/ThemeToggle'
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


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, userProfile, loading } = useAuth()

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


  return (
    // --- 1. THEME: Set base bg to light-green, text to black ---
    <div className="h-screen w-screen flex overflow-hidden bg-green-50 text-black">

      {/* --- MOBILE SIDEBAR --- */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50 bg-white border-2 border-black">
            <Menu size={24} />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-64 bg-white border-r-2 border-black">
          <aside className="flex flex-col h-full">
            <div className="p-5 text-xl font-semibold border-b-2 border-black uppercase tracking-wider">
              CollabHub
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {sidebarLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    // --- THEME: Active button is black ---
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

              <div className="pt-4 border-t border-gray-200">
                <ThemeToggle />
              </div>
            </nav>

            <div className="p-4 border-t-2 border-black">
              <Button
                onClick={handleLogout}
                // --- THEME: Bordered button ---
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
                // --- THEME: Active button is black, inactive has green hover ---
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

          <div className="pt-4 border-t border-gray-200">
            <ThemeToggle />
          </div>
        </nav>

        <div className="p-4 border-t-2 border-black">
          <Button
            onClick={handleLogout}
            // --- THEME: Bordered button ---
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-sm bg-white border-2 border-black text-black hover:bg-gray-100"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA (Middle Column) --- */}
      <div className="flex-1 flex flex-col 
                      md:ml-64 
                      md:mr-80 
                      h-full overflow-hidden">

        {/* --- HEADER --- */}
        <header className="h-16 border-b-2 border-black flex items-center justify-between px-4 md:px-6 bg-white shrink-0 sticky top-0 z-10">

          <div className="flex items-center gap-3 w-auto md:w-1/3">
            <Search size={18} className="text-gray-600" />
            <Input
              type="text"
              placeholder="Search..."
              // --- THEME: Bordered search bar ---
              className="hidden md:block bg-white border-2 border-black focus-visible:ring-1 focus-visible:ring-black placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications">
              {/* --- THEME: Bordered icon button --- */}
              <Button variant="outline" size="icon" className="bg-white border-2 border-black">
                <Bell size={20} />
              </Button>
            </Link>

            <Link href={`/dashboard/profile/${currentUser.uid}`}>
              {/* --- THEME: Bordered icon button --- */}
              <Button variant="outline" size="icon" className="bg-white border-2 border-black">
                <User size={20} />
              </Button>
            </Link>
          </div>
        </header>


        {/* --- MAIN PAGE BODY --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-green-50">
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
            // --- THEME: Black button to match sidebar ---
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