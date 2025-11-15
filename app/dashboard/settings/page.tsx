'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <Card className="max-w-lg">
        <CardHeader>Preferences</CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span>Focus Mode</span>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
