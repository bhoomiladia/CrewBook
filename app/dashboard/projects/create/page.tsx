'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// --- Firebase & Real Data Imports ---
import { db } from '@/firebaseConfig'
import { useAuth } from '@/hooks/useAuth'
import {
  writeBatch,
  doc,
  collection,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'

// Helper to convert date string to Timestamp or null
const toTimestamp = (dateString: string): Timestamp | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : Timestamp.fromDate(date);
}

export default function CreateProjectPage() {
  const router = useRouter()
  const { currentUser } = useAuth()

  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Project Info
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [techStack, setTechStack] = useState('')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isPublic, setIsPublic] = useState(false);
  
  // --- Main Firestore Handler ---
  const createProject = async () => {
    if (!currentUser) {
      setError('You must be logged in to create a project.')
      return
    }
    if (!title) {
      setError('Project title is required.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const batch = writeBatch(db)
      const projectRef = doc(collection(db, 'projects'))
      const projectId = projectRef.id
      
      // Create the project with the current user as the lead and only member
      const newProjectData = {
        name: title,
        description,
        lead: currentUser.uid, 
        members: [currentUser.uid], // Only the lead is a member initially
        techStack: techStack.split(',').map(s => s.trim()).filter(Boolean),
        budget,
        startDate: toTimestamp(startDate) || serverTimestamp(),
        endDate: toTimestamp(endDate),
        isPublic: isPublic, 
        createdAt: serverTimestamp(),
      }
      
      batch.set(projectRef, newProjectData)

      await batch.commit()
      setLoading(false)
      router.push(`/dashboard/projects/${projectId}`)

    } catch (err: any) {
      console.error("Error creating project:", err)
      setError(err.message || 'Failed to create project.')
      setLoading(false)
    }
  }

  // --- JSX ---
  return (
    <div className="flex flex-col space-y-6 px-6 py-8 max-w-3xl mx-auto">
      {/* Project Info */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" placeholder="e.g., Acme Corp Redesign" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Briefly describe your project..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <Input id="budget" placeholder="e.g., $5,000" value={budget} onChange={e => setBudget(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech-stack">Tech Stack (comma separated)</Label>
            <Input id="tech-stack" placeholder="e.g., React, Firebase" value={techStack} onChange={e => setTechStack(e.target.value)} />
          </div>
                    
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date (Optional)</Label>
            <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          
          <div className="flex items-center space-x-2 md:col-span-2 py-4">
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="is-public" className="cursor-pointer space-y-1">
              <span className="font-medium">Make Project Public</span>
              <p className="text-xs text-muted-foreground">
                Public projects will be visible on the "Explore" page.
              </p>
            </Label>
          </div>
        </div>
      </Card>

      {/* Create Button */}
      {error && <p className="text-red-500 my-4 text-center">{error}</p>}
      <Button onClick={createProject} className="w-full md:w-48 self-end" size="lg" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : 'Create Project'}
      </Button>
    </div>
  )
}