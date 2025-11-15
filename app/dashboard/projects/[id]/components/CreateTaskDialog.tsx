'use client'

import React, { useState } from 'react';
import { db } from '@/firebaseConfig';
import { UserProfileWithId } from '@/hooks/data/useProjectData';
import { Milestone } from '@/lib/types';
import { addDoc, collection, Timestamp, serverTimestamp } from 'firebase/firestore'; 
import { useAuth } from '@/hooks/useAuth';

// --- UI Imports ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Props {
  projectId: string;
  name?: string; 
  defaultStatus: 'todo' | 'inProgress' | 'done';
  members: UserProfileWithId[];
  milestones: Milestone[];
  children: React.ReactNode;
}

export function CreateTaskDialog({
  projectId,
  name = "this project",
  defaultStatus,
  members,
  milestones,
  children,
}: Props) {
  const { currentUser } = useAuth(); 
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assigneeUid, setAssigneeUid] = useState<string | undefined>();
  const [deadline, setDeadline] = useState('');
  const [milestoneId, setMilestoneId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assigneeUid || !currentUser) return; 

    setLoading(true);
    try {
      await addDoc(collection(db, 'projects', projectId, 'tasks'), {
        title: title,
        status: defaultStatus,
        assignedTo: assigneeUid,
        deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
        milestoneId: milestoneId === 'none' ? null : milestoneId || null, 
        name: name,
        projectId: projectId,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
      });

      if (assigneeUid !== currentUser.uid) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: assigneeUid,
          senderId: currentUser.uid,
          senderName: currentUser.displayName || 'Your Team Lead',
          type: 'TASK_ASSIGNMENT',
          status: 'unread',
          message: `You were assigned a new task: "${title}"`,
          projectId: projectId,
          projectName: name,
          createdAt: serverTimestamp()
        });
      }

      setTitle('');
      setAssigneeUid(undefined);
      setDeadline('');
      setMilestoneId(undefined);
      setOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* Styled Dialog */}
      <DialogContent className="sm:max-w-[425px] bg-white border-2 border-black rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-black">Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-black font-semibold">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Design the homepage"
                className="bg-white border-2 border-black rounded-lg placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-black font-semibold">Assign To</Label>
              <Select onValueChange={setAssigneeUid} value={assigneeUid}>
                <SelectTrigger id="assignee" className="bg-white border-2 border-black rounded-lg">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black rounded-lg">
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="milestone" className="text-black font-semibold">Milestone (Optional)</Label>
              <Select onValueChange={setMilestoneId} value={milestoneId}>
                <SelectTrigger id="milestone" className="bg-white border-2 border-black rounded-lg">
                  <SelectValue placeholder="Assign to a milestone" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black rounded-lg">
                  <SelectItem value="none">No Milestone</SelectItem>
                  {milestones.map(milestone => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-black font-semibold">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-white border-2 border-black rounded-lg"
              />
            </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="text-black hover:bg-gray-100 rounded-lg">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}