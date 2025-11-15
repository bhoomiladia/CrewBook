// app/dashboard/chat/components/ProjectChatList.tsx
'use client'

import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

interface Props {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
}

export function ProjectChatList({ projects, selectedProjectId, onSelectProject }: Props) {
  return (
    <aside className="w-72 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Project Chats</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.length > 0 ? (
          projects.map(project => (
            <Button
              key={project.id}
              variant={project.id === selectedProjectId ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => onSelectProject(project.id)}
            >
              <Briefcase className="h-4 w-4" />
              <span className="truncate">{project.name}</span>
            </Button>
          ))
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            You haven't joined any projects yet.
          </p>
        )}
      </nav>
    </aside>
  );
}