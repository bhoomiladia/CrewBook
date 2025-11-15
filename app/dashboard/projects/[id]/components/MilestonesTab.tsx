// app/dashboard/projects/[id]/components/MilestonesTab.tsx
'use client';

import React, { useState } from 'react';
import { db } from '@/firebaseConfig';
import { Milestone, Task } from '@/lib/types';
import { UserProfileWithId } from '@/hooks/data/useProjectData';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Props {
  milestones: Milestone[];
  tasks: Task[];
  members: UserProfileWithId[]; // <-- Key prop to get member names
  projectId: string;
}

export function MilestonesTab({ milestones, tasks = [], members, projectId }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(''); // Use string for date input
  const [loading, setLoading] = useState(false);

  const handleAddMilestone = async () => {
    if (!newTitle || !newDate) return;

    setLoading(true);
    try {
      // Create a new milestone in the sub-collection
      await addDoc(collection(db, 'projects', projectId, 'milestones'), {
        title: newTitle,
        date: Timestamp.fromDate(new Date(newDate)),
      });
      // Reset the form
      setNewTitle('');
      setNewDate('');
    } catch (error) {
      console.error("Error adding milestone: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort((a, b) => a.date.seconds - b.date.seconds);

  return (
    <div className="space-y-6">
      {/* 1. Create New Milestone Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Milestone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Milestone title (e.g., 'V1.0 Launch')"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full md:w-[200px]"
          />
          <Button onClick={handleAddMilestone} disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Milestone
          </Button>
        </CardContent>
      </Card>

      {/* 2. List of Milestones */}
      <div className="space-y-4">
        {sortedMilestones.length > 0 ? (
          sortedMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              // Pass down only the tasks for this milestone
              tasks={tasks.filter(t => t.milestoneId === milestone.id)}
              members={members}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-10">
            No milestones created yet.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Child Component for the Milestone Card ---
function MilestoneCard({
  milestone,
  tasks,
  members,
}: {
  milestone: Milestone;
  tasks: Task[];
  members: UserProfileWithId[];
}) {
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>{milestone.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Due: {milestone.date.toDate().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {completedTasks} / {tasks.length} Tasks
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2 mb-4" />
        <h4 className="font-semibold mb-2 text-sm">Tasks in this milestone:</h4>
        <div className="space-y-2">
          {tasks.length > 0 ? (
            tasks.map(task => {
              // --- This finds the assignee name (Fixes Request 2) ---
              const assignee = members.find(m => m.id === task.assignedTo);
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <p className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {assignee ? assignee.displayName.split(' ')[0] : 'Unassigned'}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No tasks assigned to this milestone.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}