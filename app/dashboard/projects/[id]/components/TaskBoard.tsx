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

  const isLead = currentUser?.uid === leadUID;

  const taskMap = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    inProgress: tasks.filter(t => t.status === 'inProgress'),
    done: tasks.filter(t => t.status === 'done'),
  }), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
      // Styled Column
      className={`bg-white border-2 border-black rounded-lg h-full ${isOver ? 'ring-2 ring-blue-500' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-black">
          {title}
          {/* Styled Count Badge */}
          <span className="text-xs font-normal text-black bg-gray-100 px-2 py-0.5 rounded-full border-2 border-black">
            {tasks.length}
          </span>
        </CardTitle>
        
        {isLead && (
            <CreateTaskDialog
              projectId={projectId}
              defaultStatus={status}
              members={members}
              milestones={milestones}
            >
            {/* Styled Add Button */}
            <Button size="icon" variant="ghost" className="h-7 w-7 text-black hover:bg-gray-100 rounded-lg">
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
            // Styled Empty State
            <div className="flex flex-col items-center justify-center h-24 text-gray-500 text-sm border-2 border-dashed border-black rounded-lg">
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
      disabled: !canDrag 
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
        canDrag={canDrag}
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
    // Styled Task Card
    <Card className={`bg-white shadow-sm border-2 border-black rounded-lg hover:shadow-md transition-all group relative`}>
      
      {!isGhost && onDelete && projectId && isLead && (
        <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 rounded-md">
          {/* Styled Edit Button */}
          <EditTaskDialog projectId={projectId} task={task} members={members}>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-black hover:bg-gray-100 rounded-lg hover:text-blue-600">
              <Edit className="h-3 w-3" />
            </Button>
          </EditTaskDialog>
          {/* Styled Delete Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-red-500 hover:bg-gray-100 rounded-lg hover:text-red-600"
            onClick={() => onDelete(task.id)}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
            <p className="font-medium text-sm leading-tight pr-6 text-black">{task.title}</p>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className={`text-xs px-1.5 py-0.5 rounded ${
              task.deadline && task.deadline.toDate() < new Date() && task.status !== 'done' 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-700'
          }`}>
             {task.deadline ? formatDeadline(task.deadline) : 'No Date'}
          </div>
          
          <div className="flex items-center gap-2">
            {assignee ? (
              // Styled Avatar
              <Avatar className="h-6 w-6 border-2 border-black" title={assignee.displayName || assignee.email}>
                <AvatarImage src={assignee.photoURL} />
                <AvatarFallback className="text-[9px]">
                  {(assignee.displayName || assignee.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              // Styled Unassigned Avatar
              <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center" title="Unassigned">
                  <span className="text-[9px] text-gray-500">?</span>
              </div>
            )}
            
            {!isGhost && (
              <div
                {...dragHandleListeners}
                className={`p-1 rounded transition-colors ${
                    canDrag 
                    ? 'hover:bg-gray-100 cursor-grab active:cursor-grabbing text-gray-500 hover:text-black' 
                    : 'cursor-not-allowed text-gray-300'
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
    if (!title) return;

    setLoading(true);
    try {
      const taskRef = doc(db, 'projects', projectId, 'tasks', task.id);
      
      await updateDoc(taskRef, {
        title: title,
        assignedTo: assigneeUid || null,
        deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
      });

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
      {/* Styled Dialog */}
      <DialogContent className="sm:max-w-[425px] bg-white border-2 border-black rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-black">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-black font-semibold">Task Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white border-2 border-black rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-black font-semibold">Assign To</Label>
              <Select onValueChange={setAssigneeUid} value={assigneeUid || ''}>
                <SelectTrigger className="bg-white border-2 border-black rounded-lg">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black rounded-lg">
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.displayName}</SelectItem>
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
             {/* Styled Save Button */}
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}