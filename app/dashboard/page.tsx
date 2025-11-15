'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ListTodo, Plus, Loader2, CheckCircle2, Circle, ArrowUpRight } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// --- Our Types and Hooks ---
import { Project, Task } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/data/useUserProjects';
import { useUserTasks } from '@/hooks/data/useUserTasks';

function formatDeadline(timestamp: Timestamp | null): string {
  if (!timestamp) return 'No Deadline';
  return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// --- ProjectCard ---
const ProjectCard = ({ project }: { project: Project }) => {
  const budget = project.budget || 0;
  const expenses = project.expenses || 0;
  const percent = Number(budget) > 0 ? Math.min((expenses / Number(budget)) * 100, 100) : 0;

  return (
    <Card className="flex flex-col h-full bg-white border-2 border-black transition-all hover:shadow-[4px_4px_0px_#000]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold truncate w-3/4 text-black">
            {project.name}
          </h3>
          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
            In Progress
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2 h-10">
            {project.description}
        </p>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div className="space-y-2">
           <div className="flex justify-between text-xs text-gray-600">
             <span>Budget Used</span>
             <span>{Math.round(percent)}%</span>
           </div>
           <Progress value={percent} className="h-2 [&>div]:bg-green-500" />
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button variant="outline" size="sm" asChild className="w-full bg-white border-2 border-black text-black hover:bg-gray-100">
          <Link href={`dashboard/projects/${project.id}`}>Open Project</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// --- TaskItem (Updated) ---
const TaskItem = ({ task }: { task: Task }) => {
  const targetLink = task.projectId 
    ? `/dashboard/projects/${task.projectId}` 
    : '#';

  return (
    <Link href={targetLink} className="block group">
      <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-black bg-white hover:bg-green-50 transition-all">
        {task.status === 'done' ? 
            <CheckCircle2 size={20} className="text-green-500 shrink-0" /> : 
            <Circle size={20} className="text-gray-500 shrink-0 group-hover:text-green-600" />
        }
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate text-black group-hover:text-green-700 transition-colors">
            {task.title}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
             {task.name && (
               <span className="bg-green-100 text-green-800 font-medium truncate max-w-[100px] px-1.5 py-0.5 rounded">
                 {task.name}
               </span>
             )}
             <span className="truncate">Due: {formatDeadline(task.deadline)}</span>
          </div>
        </div>

        <Badge 
          variant={task.status === 'inProgress' ? 'default' : 'secondary'} 
          className={`shrink-0 ${
            task.status === 'inProgress' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
          }`}
        >
            {task.status === 'inProgress' ? 'In Progress' : 'To Do'}
        </Badge>
      </div>
    </Link>
  );
};


// --- Main Dashboard ---
export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const userName = currentUser?.displayName?.split(' ')[0] || 'User';

  // Fetch Data
  const { projects, loading: projectsLoading } = useUserProjects(currentUser?.uid);
  const { tasks, loading: tasksLoading } = useUserTasks(currentUser?.uid);

  const isLoading = projectsLoading || tasksLoading;
  const openTasks = tasks.filter(t => t.status !== 'done');

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-4 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">Welcome back, {userName} 👋</h1>
            <p className="text-gray-600">Here is what's happening with your projects today.</p>
        </div>
        <Button onClick={() => router.push('dashboard/projects/create')} className="bg-black text-white hover:bg-gray-800">
          <Plus size={18} className="mr-2" /> Create Project
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard 
            icon={<Briefcase size={24} />} 
            label="Active Projects" 
            value={projects.length} 
            color="green" 
        />
        <StatCard 
            icon={<ListTodo size={24} />} 
            label="Pending Tasks" 
            value={openTasks.length}
            color="blue" 
        />
        <StatCard 
            icon={<CheckCircle2 size={24} />} 
            label="Completed Tasks" 
            value={tasks.filter(t => t.status === 'done').length}
            color="green" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-black">Active Projects</h2>
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map(proj => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          ) : (
            <EmptyState 
                message="You haven't joined any projects yet." 
                action={() => router.push('dashboard/projects/create')} 
            />
          )}
        </div>
        
        {/* Task List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight text-black">My Tasks</h2>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black" onClick={() => router.push('dashboard/tasks')}>
              View All
            </Button>
          </div>
          <Card className="h-full min-h-[300px] flex flex-col bg-white border-2 border-black">
            <CardContent className="space-y-3 pt-6 flex-grow">
              {openTasks.length > 0 ? (
                openTasks.slice(0, 5).map(task => (
                  <TaskItem key={task.id} task={task} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 py-10">
                   <div className="bg-green-100 p-4 rounded-full mb-3">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                   </div>
                   <p className="font-medium text-black">All caught up!</p>
                   <p className="text-sm mt-1">No pending tasks assigned to you.</p>
                </div>
              )}
            </CardContent>
            {openTasks.length > 5 && (
               <CardFooter className="pt-0 pb-4">
                  <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-black" onClick={() => router.push('dashboard/tasks')}>
                    See {openTasks.length - 5} more tasks
                  </Button>
               </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
const StatCard = ({ icon, label, value, color = 'green' }: any) => (
    <Card className="bg-white border-2 border-black">
        <CardContent className="flex items-center gap-4 pt-6">
        <div className={`p-3 rounded-lg ${
          color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
        }`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-3xl font-bold text-black">{value}</p>
        </div>
        </CardContent>
    </Card>
)

// --- FIX: Updated EmptyState to match the theme ---
const EmptyState = ({ message, action }: any) => (
    <Card className="flex flex-col items-center justify-center p-10 border-2 border-black border-dashed bg-white">
        <p className="text-gray-600 mb-4 text-center">{message}</p>
        <Button variant="outline" className="bg-white border-2 border-black text-black hover:bg-gray-100" onClick={action}>
          Get Started
        </Button>
    </Card>
)