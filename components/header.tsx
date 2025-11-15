"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, LogOut } from "lucide-react"

interface HeaderProps {
  onLoginClick: () => void
  isLoggedIn: boolean
}

export default function Header({ onLoginClick, isLoggedIn }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">CrewBook</span>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoginClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          ) : (
            <Button size="sm" className="gradient-primary text-white border-0" onClick={onLoginClick}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
