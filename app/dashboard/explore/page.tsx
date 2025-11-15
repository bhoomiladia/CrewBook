'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Users, Briefcase, Loader2 } from 'lucide-react'

// --- Data Hooks & Types ---
import { usePublicProjects } from '@/hooks/data/usePublicProjects'
import { useUserDirectory } from '@/hooks/data/useUserDirectory'
import { Project } from '@/lib/types'
import { UserProfileWithId } from '@/hooks/data/useProjectData'

export default function ExplorePage() {
  const [search, setSearch] = useState('')

  // --- Data Fetching ---
  const { projects, loading: projectsLoading } = usePublicProjects()
  const { users, loading: usersLoading } = useUserDirectory()

  // --- Filtered Data ---
  const filteredProjects = useMemo(
    () =>
      projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [projects, search]
  )

  const filteredCollabs = useMemo(
    () =>
      users.filter((u) =>
        (u.displayName || u.email)
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [users, search]
  )

  const isLoading = projectsLoading || usersLoading

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Explore</h1>
        {/* Styled Input */}
        <Input
          placeholder="Search projects or people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-white border-2 border-black rounded-lg placeholder:text-gray-500"
        />
      </div>

      {/* --- Tabs --- */}
      <Tabs defaultValue="projects" className="flex-1 flex flex-col overflow-hidden">
        {/* Styled TabsList */}
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4 bg-gray-100 rounded-lg border-2 border-black p-1">
          {/* Styled TabsTrigger */}
          <TabsTrigger 
            value="projects" 
            className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-600"
          >
            <Briefcase size={16} /> Projects
          </TabsTrigger>
          <TabsTrigger 
            value="collabs" 
            className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-600"
          >
            <Users size={16} /> Find Collaborators
          </TabsTrigger>
        </TabsList>

        {/* --- Loading State --- */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {/* === PROJECTS TAB === */}
            <TabsContent value="projects" className="flex-1 overflow-y-auto pr-2">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <p className="text-gray-600">No public projects found.</p>
                )}
              </div>
            </TabsContent>

            {/* === COLLABORATORS TAB === */}
            <TabsContent value="collabs" className="flex-1 overflow-y-auto pr-2">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCollabs.length > 0 ? (
                  filteredCollabs.map((user) => (
                    <CollaboratorCard key={user.id} user={user} />
                  ))
                ) : (
                  <p className="text-gray-600">No collaborators found.</p>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              🔹 PROJECT CARD 🔹                             */
/* -------------------------------------------------------------------------- */
function ProjectCard({ project }: { project: Project }) {
  const { id, name, description, members, techStack } = project

  return (
    // Styled Card
    <Card className="bg-white border-2 border-black rounded-lg hover:shadow-md transition-shadow flex flex-col h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <h2 className="font-semibold text-lg mb-2 text-black">{name}</h2>
        <p className="text-sm text-gray-700 flex-1 line-clamp-2">
          {description}
        </p>
        <div className="mt-3 text-xs text-gray-600">
          <span className="font-medium text-black">Team Size:</span> {members?.length || 0}
        </div>
        <div className="mt-2 text-xs font-medium">
          <span className="text-gray-600">Tech:</span>{' '}
          <span className="text-black">{techStack?.slice(0, 2).join(', ') || 'N/A'}</span>
        </div>
        {/* Styled Button */}
        <Button className="mt-4 w-full bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800" asChild>
          <Link href={`/dashboard/projects/${id}`}>View Project</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                         🔹 COLLABORATOR CARD 🔹                           */
/* -------------------------------------------------------------------------- */
function CollaboratorCard({ user }: { user: UserProfileWithId }) {
  const {
    id,
    displayName,
    email,
    photoURL,
    skills = [],
    workloadStatus,
  } = user

  const isAvailable = workloadStatus === 'light'

  return (
    // Styled Card
    <Card className="bg-white border-2 border-black rounded-lg hover:shadow-md transition-shadow flex flex-col h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Styled Avatar */}
            <Avatar className="w-8 h-8 border-2 border-black">
              <AvatarImage src={photoURL} alt={displayName || email} />
              <AvatarFallback>
                {(displayName || email)?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-semibold text-sm text-black">{displayName || email}</h2>
          </div>
          {/* Styled Badge */}
          <Badge 
            className={isAvailable 
              ? 'bg-black text-white border-2 border-black rounded-md' 
              : 'bg-white text-black border-2 border-black rounded-md'
            }
          >
            {isAvailable ? 'Available' : workloadStatus || 'Busy'}
          </Badge>
        </div>

        <p className="text-sm text-gray-700 truncate">{email}</p>
        <div className="mt-3 text-xs text-gray-600 flex-1">
          <span className="font-medium text-black">Skills:</span>{' '}
          {skills.length > 0 ? skills.join(', ') : 'Not listed'}
        </div>

        {/* Styled Button */}
        <Button className="mt-4 w-full bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800" asChild>
          <Link href={`/dashboard/profile/${id}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  )
}