'use client'

import { useState } from 'react'
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // This is the full page structure
  return (
    <div className="flex flex-col">
  	  {/* --- Page Header --- */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

  	  {/* --- Tab Buttons --- */}
      <div className="flex gap-2 mb-4 border-b">
        {tabs.map(tab => (
    	  <Button
    		key={tab.id}
    		variant="ghost"
    		className={`h-9 text-xs rounded-none ${
        	  activeTab === tab.id
        	  ? 'border-b-2 border-primary text-primary'
        	  : 'text-muted-foreground'
    		}`}
    		onClick={() => setActiveTab(tab.id)}
    	  >
    		{tab.title}
    	  </Button>
        ))}
      </div>

      {/* --- Tab Content (This is what you had) --- */}
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
          <MembersTab members={members} leadUID={project.lead} projectId={project.id} name = {project.name}/>
        )}
        {activeTab === 'stats' && (
          <StatsTab tasks={tasks} members={members} />
        )}
      </div>
    </div>
  )
}