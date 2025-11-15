// app/dashboard/explore/page.tsx
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
        <h1 className="text-2xl font-semibold">Explore</h1>
        <Input
          placeholder="Search projects or people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* --- Tabs --- */}
      <Tabs defaultValue="projects" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
          <TabsTrigger value="projects" className="flex items-center justify-center gap-2">
            <Briefcase size={16} /> Projects
          </TabsTrigger>
          <TabsTrigger value="collabs" className="flex items-center justify-center gap-2">
            <Users size={16} /> Find Collaborators
          </TabsTrigger>
        </TabsList>

        {/* --- Loading State --- */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
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
                  <p className="text-muted-foreground">No public projects found.</p>
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
                  <p className="text-muted-foreground">No collaborators found.</p>
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
/*                              🔹 PROJECT CARD 🔹                             */
/* -------------------------------------------------------------------------- */
function ProjectCard({ project }: { project: Project }) {
  const { id, name, description, members, techStack } = project

  return (
    <Card className="hover:shadow-md transition-shadow bg-card/90 backdrop-blur-sm">
      <CardContent className="p-4 flex flex-col h-full">
        <h2 className="font-semibold text-lg mb-2">{name}</h2>
        <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
          {description}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          <span className="font-medium">Team Size:</span> {members?.length || 0}
        </div>
        <div className="mt-2 text-xs font-medium">
          <span className="text-muted-foreground">Tech:</span>{' '}
          {techStack?.slice(0, 2).join(', ') || 'N/A'}
        </div>
        <Button className="mt-4 w-full" asChild>
          <Link href={`/dashboard/projects/${id}`}>View Project</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

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
    <Card className="hover:shadow-md transition-shadow bg-card/90 backdrop-blur-sm">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={photoURL} alt={displayName || email} />
              <AvatarFallback>
                {(displayName || email)?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-semibold text-sm">{displayName || email}</h2>
          </div>
          <Badge variant={isAvailable ? 'default' : 'outline'}>
            {isAvailable ? 'Available' : workloadStatus || 'Busy'}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground truncate">{email}</p>
        <div className="mt-3 text-xs text-muted-foreground flex-1">
          <span className="font-medium">Skills:</span>{' '}
          {skills.length > 0 ? skills.join(', ') : 'Not listed'}
        </div>

        <Button className="mt-4 w-full" asChild>
          <Link href={`/dashboard/profile/${id}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
