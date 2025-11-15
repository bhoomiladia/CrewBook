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
  members: UserProfileWithId[]; 
  projectId: string;
}

export function MilestonesTab({ milestones, tasks = [], members, projectId }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleAddMilestone = async () => {
    if (!newTitle || !newDate) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'projects', projectId, 'milestones'), {
        title: newTitle,
        date: Timestamp.fromDate(new Date(newDate)),
      });
      setNewTitle('');
      setNewDate('');
    } catch (error) {
      console.error("Error adding milestone: ", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.date.seconds - b.date.seconds);

  return (
    <div className="space-y-6">
      {/* 1. Create New Milestone Card */}
      <Card className="bg-white border-2 border-black rounded-lg">
        <CardHeader>
          <CardTitle className="text-black">Create New Milestone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Milestone title (e.g., 'V1.0 Launch')"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-white border-2 border-black rounded-lg placeholder:text-gray-500"
          />
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full md:w-[200px] bg-white border-2 border-black rounded-lg"
          />
          <Button 
            onClick={handleAddMilestone} 
            disabled={loading} 
            className="w-full md:w-auto bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800"
          >
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
              tasks={tasks.filter(t => t.milestoneId === milestone.id)}
              members={members}
            />
          ))
        ) : (
          <p className="text-gray-600 text-center py-10">
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
    <Card className="bg-white border-2 border-black rounded-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-black" />
          <div>
            <CardTitle className="text-black">{milestone.title}</CardTitle>
            <p className="text-sm text-gray-600">
              Due: {milestone.date.toDate().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-700 font-medium">
          {completedTasks} / {tasks.length} Tasks
        </div>
      </CardHeader>
      <CardContent>
        {/* Styled Progress Bar */}
        <Progress 
          value={progress} 
          className="h-2 mb-4 bg-gray-200 border border-black [&>*]:bg-green-500" 
        />
        <h4 className="font-semibold mb-2 text-sm text-black">Tasks in this milestone:</h4>
        <div className="space-y-2">
          {tasks.length > 0 ? (
            tasks.map(task => {
              const assignee = members.find(m => m.id === task.assignedTo);
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border-2 border-gray-200"
                >
                  <p className={`text-sm text-black ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </p>
                  <span className="text-sm text-gray-600">
                    {assignee ? assignee.displayName.split(' ')[0] : 'Unassigned'}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-600">
              No tasks assigned to this milestone.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}