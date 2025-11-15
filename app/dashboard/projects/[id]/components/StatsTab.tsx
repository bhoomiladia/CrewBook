// app/dashboard/projects/[id]/components/StatsTab.tsx
'use client' 

import React, { useMemo, useState, useEffect } from 'react';
import { Task, UserProfile } from '@/lib/types';
import { UserProfileWithId } from '@/hooks/data/useProjectData'; // Import this
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/firebaseConfig'; // Import db
import { doc, getDoc } from 'firebase/firestore'; // Import getDoc
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  tasks: Task[];
  members: UserProfileWithId[]; // <-- This is the prop we use
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

// --- Helper hook to get full profiles ---
// This is now redundant since we pass 'members' as a prop,
// but we'll fix the workloadData to use the prop.

export function StatsTab({ tasks, members }: Props) {
  
  // --- 1. Calculate Pie Chart Data ---
  const taskStatusData = useMemo(() => {
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProgress = tasks.filter(t => t.status === 'inProgress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    return [
      { name: 'To Do', value: todo },
      { name: 'In Progress', value: inProgress },
      { name: 'Done', value: done },
    ];
  }, [tasks]);

  // --- 2. Calculate Bar Chart Data (Workload) ---
  const workloadData = useMemo(() => {
    if (!members || members.length === 0) return [];
    
    const taskCounts = new Map<string, number>();
    tasks.forEach(task => {
      if (task.status !== 'done') {
        taskCounts.set(task.assignedTo, (taskCounts.get(task.assignedTo) || 0) + 1);
      }
    });

    return members.map(user => ({
      // --- THIS IS THE FIX ---
      // Provide fallbacks in case displayName is undefined
      name: (user.displayName || user.email || 'Unknown').split(' ')[0],
      // --- END FIX ---
      tasks: taskCounts.get(user.id) || 0,
    }));
  }, [tasks, members]);
  
  // --- 3. Simple Stat Cards ---
  const totalTasks = tasks.length;
  const doneTasks = taskStatusData[2].value;
  const openTasks = taskStatusData[0].value + taskStatusData[1].value;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total Tasks" value={totalTasks} />
        <StatCard title="Completed Tasks" value={doneTasks} />
        <StatCard title="Open Tasks" value={openTasks} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Task Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component
function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}