'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear user session here (when implemented)
    setTimeout(() => router.push('/'), 1000)
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Logging out...</p>
    </div>
  )
}
