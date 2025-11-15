'use client'

import React, { useState } from 'react';
import { db } from '@/firebaseConfig';
import { UserProfileWithId } from '@/hooks/data/useProjectData';
import { Milestone } from '@/lib/types';
// --- 1. Added imports ---
import { addDoc, collection, Timestamp, serverTimestamp } from 'firebase/firestore'; 
import { useAuth } from '@/hooks/useAuth'; // <-- To get current user

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
  name?: string; // <-- 2. Added prop for notification context
  defaultStatus: 'todo' | 'inProgress' | 'done';
  members: UserProfileWithId[];
  milestones: Milestone[];
  children: React.ReactNode;
}

export function CreateTaskDialog({
  projectId,
  name = "this project", // <-- Default value
  defaultStatus,
  members,
  milestones,
  children,
}: Props) {
  const { currentUser } = useAuth(); // <-- 3. Get the current user
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assigneeUid, setAssigneeUid] = useState<string | undefined>();
  const [deadline, setDeadline] = useState('');
  const [milestoneId, setMilestoneId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add check for currentUser
    if (!title || !assigneeUid || !currentUser) return; 

    setLoading(true);
    try {
      // --- 4. Create the Task Document ---
      await addDoc(collection(db, 'projects', projectId, 'tasks'), {
        title: title,
        status: defaultStatus,
        assignedTo: assigneeUid,
        deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
        // Fix: Handle the "none" value from the select
        milestoneId: milestoneId === 'none' ? null : milestoneId || null, 
        name: name, // Use the prop
        projectId: projectId,     // Add projectId for security rules
        createdAt: serverTimestamp(), // Add creation timestamp
        createdBy: currentUser.uid  // Add creator
      });

      // --- 5. (NEW) Send Notification Logic ---
      // Only send a notification if you're assigning it to someone ELSE
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
      // --- End of Notification Logic ---

      // Reset form
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4"> {/* Use grid on form */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Design the homepage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To</Label>
              <Select onValueChange={setAssigneeUid} value={assigneeUid}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="milestone">Milestone (Optional)</Label>
              <Select onValueChange={setMilestoneId} value={milestoneId}>
                <SelectTrigger id="milestone">
                  <SelectValue placeholder="Assign to a milestone" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}