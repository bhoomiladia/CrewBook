'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

// --- Import the hook with the 'members' property ---
import { useProjectData, UserProfileWithId } from '@/hooks/data/useProjectData'

// --- Import Tab Components ---
import { ProjectInfoTab } from './components/ProjectInfoTab'
import { MilestonesTab } from './components/MilestonesTab'
import { MembersTab } from './components/MembersTab'
import { StatsTab } from './components/StatsTab'
import { Loader2 } from 'lucide-react'

const tabs = [
  { id: 'info', title: 'Project Info & Tasks' },
  { id: 'milestones', title: 'Milestones' },
  { id: 'members', title: 'Team Members' },
  { id: 'stats', title: 'Stats' },
]

export default function ProjectPage() {
  const [activeTab, setActiveTab] = useState('info');
  const params = useParams();
  const projectId = params.id as string;

  // --- 'members' IS NOW AVAILABLE ---
  const { project, tasks, milestones, members, loading } = useProjectData(projectId);

  if (loading || !project) { // Add !project check
    return (
      <div className="flex items-center justify-center p-10">
        {/* --- THEME: Updated loader color --- */}
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // This is the full page structure
  return (
    <div className="flex flex-col">
      {/* --- Page Header (Themed) --- */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-black">{project.name}</h1>
        <p className="text-gray-600">{project.description}</p>
      </div>

      {/* --- Tab Buttons (Themed) --- */}
      <div className="flex gap-1 mb-4 border-b-2 border-black">
        {tabs.map(tab => (
        <Button
          key={tab.id}
          variant="ghost"
          // --- THEME: Updated tab styles ---
          className={`h-9 text-sm rounded-none px-4 ${
            activeTab === tab.id
              ? 'border-b-2 border-black text-black font-semibold' // Active tab
              : 'text-gray-500 hover:text-black hover:bg-gray-100' // Inactive tab
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.title}
        </Button>
        ))}
      </div>

      {/* --- Tab Content --- */}
      {/* The components below must be styled in their own files */}
      <div>
        {activeTab === 'info' && (
          <ProjectInfoTab
            project={project}
            tasks={tasks}
            members={members}
            milestones={milestones} 
          />
        )}
        {activeTab === 'milestones' && (
          <MilestonesTab
            milestones={milestones}
            tasks={tasks}
            members={members}
            projectId={projectId}
          />
        )}
        {activeTab === 'members' && (
          <MembersTab 
            members={members} 
            leadUID={project.lead} 
            projectId={project.id} 
            name={project.name}
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab tasks={tasks} members={members} />
        )}
      </div>
    </div>
  )
}