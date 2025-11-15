'use client'

import React from 'react';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hash } from 'lucide-react';

interface Props {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
}

export function ProjectChatList({ projects, selectedProjectId, onSelectProject }: Props) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b-2 border-black shrink-0">
        <h2 className="text-xl font-semibold uppercase tracking-wider">
          Projects
        </h2>
      </div>
      
      {/* List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {projects.map(project => {
            const isActive = project.id === selectedProjectId;
            return (
              <Button
                key={project.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start text-sm rounded-lg h-12 gap-2 ${
                  isActive
                    ? 'bg-black text-white font-medium' // Active state
                    : 'text-black hover:bg-green-100' // Inactive state
                }`}
                onClick={() => onSelectProject(project.id)}
              >
                <Hash className="h-4 w-4" />
                <span className="truncate">{project.name}</span>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  );
}