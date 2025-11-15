'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/data/useUserProjects';
import { ProjectChatList } from './components/ProjectChatList';
import { ProjectMessageView } from './components/ProjectMessageView';
import { Loader2, Menu } from 'lucide-react';

import {
  Sheet,
  SheetTrigger,
  SheetContent
} from "@/components/ui/sheet";
import { Project } from '@/lib/types';

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
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    // --- THEME ---
    // Changed to white bg, black border, and removed rounded-lg
    <div className="relative flex h-full min-h-0 border-2 border-black overflow-hidden bg-white">

      {/* --- Mobile Menu --- */}
      <div className="md:hidden absolute top-3 right-3 z-50">
        <Sheet>
          <SheetTrigger className="p-2 rounded-md bg-white border-2 border-black shadow-md">
            <Menu size={22} />
          </SheetTrigger>

          <SheetContent side="right" className="p-0 w-72 bg-white border-l-2 border-black">
            <ProjectChatList
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* --- Desktop Project List --- */}
      <div className="hidden md:block h-full border-r-2 border-black w-72">
        <ProjectChatList
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      </div>

      {/* --- Main Chat Window --- */}
      <div className="flex-1 h-full flex flex-col">
        <ProjectMessageView project={selectedProject} />
      </div>

    </div>
  );
}