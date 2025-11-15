'use client';

// --- React & DND-Kit Imports ---
import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Firebase Imports ---
import { Timestamp, doc, updateDoc, serverTimestamp, deleteDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// --- Auth Import ---
import { useAuth } from '@/hooks/useAuth';

// --- Type Imports ---
import { Task, Milestone } from '@/lib/types';
import { UserProfileWithId } from '@/hooks/data/useProjectData';

// --- Shadcn UI Imports ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash, GripVertical, Edit, Lock } from 'lucide-react'; 

// --- Component Imports ---
import { CreateTaskDialog } from './CreateTaskDialog';

// --- Helper to format deadline ---
function formatDeadline(timestamp: Timestamp | null): string {
  if (!timestamp) return '';
  return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// --- Main Board Component ---
interface TaskBoardProps {
  tasks: Task[];
  projectId: string;
  members: UserProfileWithId[];
  milestones: Milestone[];
  leadUID: string; 
}

export function TaskBoard({ tasks, projectId, members, milestones, leadUID }: TaskBoardProps) {
  const { currentUser } = useAuth();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // 1. Define Role: Is the user the Project Lead?
  const isLead = currentUser?.uid === leadUID;

  const taskMap = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    inProgress: tasks.filter(t => t.status === 'inProgress'),
    done: tasks.filter(t => t.status === 'done'),
  }), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags on click
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return; 
    
    const task = tasks.find(t => t.id === active.id);
    if (!task) return;
    
    // --- SECURITY CHECK ---
    // Ensure the user is allowed to move this specific task
    const isAssigned = task.assignedTo === currentUser?.uid;
    
    if (!isLead && !isAssigned) {
        console.warn("Unauthorized move attempt blocked.");
        return;
    }

    const newStatus = over.id as 'todo' | 'inProgress' | 'done';

    if (task.status !== newStatus) {
      try {
        const taskRef = doc(db, 'projects', projectId, 'tasks', task.id);
        await updateDoc(taskRef, { status: newStatus });
      } catch (error) {
        console.error("Failed to update task status:", error);
      }
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!isLead) return; 
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        await deleteDoc(taskRef);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid md:grid-cols-3 gap-6">
        {(['todo', 'inProgress', 'done'] as const).map((status) => (
          <TaskColumn
            key={status}
            title={status === 'inProgress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            status={status}
            tasks={taskMap[status]}
            members={members}
            projectId={projectId}
            milestones={milestones}
            onDeleteTask={handleDeleteTask}
            isLead={isLead} 
            currentUserId={currentUser?.uid}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            members={members}
            isGhost={true}
            // Ghost card always looks "dragged"
            canDrag={true} 
            isLead={isLead}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// --- TaskColumn Component ---
const TaskColumn = ({
  title, status, tasks, members, projectId, milestones, onDeleteTask, isLead, currentUserId
}: {
  title: string;
  status: 'todo' | 'inProgress' | 'done';
  tasks: Task[];
  members: UserProfileWithId[];
  projectId: string;
  milestones: Milestone[];
  onDeleteTask: (taskId: string) => void;
  isLead: boolean;
  currentUserId?: string;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  return (
    <Card
      ref={setNodeRef}
      className={`bg-muted/50 h-full ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {title}
          <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
            {tasks.length}
          </span>
        </CardTitle>
        
        {/* Only Lead can Create Tasks */}
        {isLead && (
            <CreateTaskDialog
              projectId={projectId}
              defaultStatus={status}
              members={members}
              milestones={milestones}
            >
            <Button size="icon" variant="ghost" className="h-7 w-7">
                <Plus className="h-5 w-5" />
            </Button>
            </CreateTaskDialog>
        )}
      </CardHeader>
      <CardContent className="space-y-3 min-h-[150px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map(task => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                members={members}
                projectId={projectId}
                onDelete={onDeleteTask}
                isLead={isLead}
                currentUserId={currentUserId}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
              No tasks
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
};

// --- Draggable TaskCard Wrapper ---
const DraggableTaskCard = ({ 
    task, members, projectId, onDelete, isLead, currentUserId 
}: {
  task: Task;
  members: UserProfileWithId[];
  projectId: string;
  onDelete: (taskId: string) => void;
  isLead: boolean;
  currentUserId?: string;
}) => {
  
  // --- PERMISSION LOGIC ---
  // 1. Is the user the Lead?
  // 2. Is the user assigned to this specific task?
  const isAssignedToMe = task.assignedTo === currentUserId;
  const canDrag = isLead || isAssignedToMe;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
      id: task.id,
      disabled: !canDrag // <--- KEY: Disables drag for unauthorized users
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        members={members}
        projectId={projectId}
        onDelete={onDelete}
        dragHandleListeners={listeners}
        isLead={isLead}
        canDrag={canDrag} // Pass down to show/hide Lock icon
      />
    </div>
  );
};

// --- TaskCard Component ---
const TaskCard = ({
  task,
  members,
  projectId,
  onDelete,
  dragHandleListeners,
  isGhost = false,
  isLead = false,
  canDrag = true,
}: {
  task: Task;
  members: UserProfileWithId[];
  projectId?: string;
  onDelete?: (taskId: string) => void;
  dragHandleListeners?: any;
  isGhost?: boolean;
  isLead?: boolean;
  canDrag?: boolean;
}) => {
  const assignee = members.find(m => m.id === task.assignedTo);

  return (
    <Card className={`bg-card shadow-sm hover:shadow-md transition-all group relative border-l-4 ${
        // Visual helper: Colored border based on priority or status (Optional, here using status)
        task.status === 'done' ? 'border-l-green-500' : 
        task.status === 'inProgress' ? 'border-l-blue-500' : 'border-l-gray-300'
    }`}>
      
      {/* --- EDIT & DELETE (LEAD ONLY) --- */}
      {!isGhost && onDelete && projectId && isLead && (
        <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 rounded-md shadow-sm">
          <EditTaskDialog projectId={projectId} task={task} members={members}>
            <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-blue-600">
              <Edit className="h-3 w-3" />
            </Button>
          </EditTaskDialog>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-red-500 hover:text-red-600"
            onClick={() => onDelete(task.id)}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
            <p className="font-medium text-sm leading-tight pr-6">{task.title}</p>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          {/* Deadline Badge */}
          <div className={`text-xs px-1.5 py-0.5 rounded ${
              task.deadline && task.deadline.toDate() < new Date() && task.status !== 'done' 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-muted-foreground'
          }`}>
             {task.deadline ? formatDeadline(task.deadline) : 'No Date'}
          </div>
          
          <div className="flex items-center gap-2">
            {assignee ? (
              <Avatar className="h-6 w-6 border ring-1 ring-white" title={assignee.displayName || assignee.email}>
                <AvatarImage src={assignee.photoURL} />
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                  {(assignee.displayName || assignee.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-100 border flex items-center justify-center" title="Unassigned">
                 <span className="text-[9px] text-gray-400">?</span>
              </div>
            )}
            
            {/* --- DRAG HANDLE / LOCK --- */}
            {!isGhost && (
              <div
                {...dragHandleListeners}
                className={`p-1 rounded transition-colors ${
                    canDrag 
                    ? 'hover:bg-gray-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700' 
                    : 'cursor-not-allowed text-gray-200'
                }`}
              >
                {canDrag ? (
                   <GripVertical className="h-4 w-4" />
                ) : (
                   <Lock className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- EditTaskDialog ---
interface EditTaskProps {
  projectId: string;
  task: Task;
  members: UserProfileWithId[];
  children: React.ReactNode;
}

function EditTaskDialog({ projectId, task, members, children }: EditTaskProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [assigneeUid, setAssigneeUid] = useState(task.assignedTo);
  const [deadline, setDeadline] = useState(
    task.deadline ? task.deadline.toDate().toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return; // Assignee can remain empty/undefined if needed

    setLoading(true);
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', task.id);
      
      await updateDoc(taskRef, {
        title: title,
        assignedTo: assigneeUid || null,
        deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
      });

      // Notify if assignee changed
      if (assigneeUid && assigneeUid !== task.assignedTo && assigneeUid !== currentUser?.uid) {
         await addDoc(collection(db, 'notifications'), {
          recipientId: assigneeUid,
          senderId: currentUser?.uid,
          senderName: currentUser?.displayName || 'Lead',
          type: 'TASK_ASSIGNMENT',
          projectId: projectId,
          message: `Updated task assignment: "${title}"`,
          status: 'unread',
          createdAt: serverTimestamp()
        });
      }

      setOpen(false);
    } catch (error) {
      console.error("Error updating task: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To</Label>
              <Select onValueChange={setAssigneeUid} value={assigneeUid || ''}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}