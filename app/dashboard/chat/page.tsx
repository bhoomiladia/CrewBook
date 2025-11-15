'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/data/useUserProjects';
import { ProjectChatList } from './components/ProjectChatList';
import { ProjectMessageView } from './components/ProjectMessageView';
import { Loader2, Menu } from 'lucide-react'; // Removed EllipsisVertical

import {
  Sheet,
  SheetTrigger,
  SheetContent
} from "@/components/ui/sheet";
import { Project } from '@/lib/types'; // Import Project type

export default function ChatPage() {
  const { currentUser } = useAuth();
  const { projects, loading: projectsLoading } = useUserProjects(currentUser?.uid);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select first project
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 border rounded-lg overflow-hidden">

      
      <div className="md:hidden absolute top-3 right-3 z-50"> {/* MOVED from left-3 to right-3 */}
        <Sheet>
          <SheetTrigger className="p-2 rounded-md bg-card shadow">
            <Menu size={22} /> {/* Kept Menu icon */}
          </SheetTrigger>

          <SheetContent side="right" className="p-0 w-72"> {/* MOVED from side="left" */}
            <ProjectChatList
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          </SheetContent>
        </Sheet>
      </div>

     
      <div className="hidden md:block h-full border-r">
        <ProjectChatList
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      </div>

      <div className="flex-1 h-full">
        <ProjectMessageView project={selectedProject} />
      </div>

    </div>
  );
}