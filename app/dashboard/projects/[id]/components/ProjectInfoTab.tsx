'use client'

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Project, Task, Milestone, UserProfile } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskBoard } from './TaskBoard'
import { UserProfileWithId } from '@/hooks/data/useProjectData';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { db } from "@/firebaseConfig";
import {
  doc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import {
  Globe,
  Lock,
  Calendar,
  Code,
  Wallet,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
// --- 1. IMPORT THE NEW COMPONENT ---
import { TeamRatingCard } from "./TeamRatingCard"; 

interface Props {
  project: Project
  tasks: Task[]
  members: UserProfileWithId[]
  milestones: Milestone[]
}

export function ProjectInfoTab({ project, tasks, members, milestones }: Props) {
  const { currentUser } = useAuth();
  const isLead = currentUser?.uid === project.lead;
  const isCompleted = project.status === 'completed';

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
    action: null as (() => void) | null,
  });
  
  const formatDateForInput = (ts?: Timestamp) => 
    ts ? ts.toDate().toISOString().split('T')[0] : '';

  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    budget: project.budget,
    expenses: project.expenses || 0,
    isPublic: project.isPublic || false,
    lead: project.lead,
    startDate: formatDateForInput(project.startDate),
    endDate: formatDateForInput(project.endDate),
    techStack: project.techStack ? project.techStack.join(', ') : '',
    status: project.status || 'planning',
  });

  useEffect(() => {
    setForm({
      name: project.name,
      description: project.description,
      budget: project.budget,
      expenses: project.expenses || 0,
      isPublic: project.isPublic || false,
      lead: project.lead,
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      techStack: project.techStack ? project.techStack.join(', ') : '',
      status: project.status || 'planning',
    });
  }, [project, editMode]);

  const triggerConfirm = (
    title: string,
    description: string,
    action: () => void
  ) => {
    setDialogContent({ title, description, action });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "projects", project.id), {
        name: form.name,
        description: form.description,
        budget: Number(form.budget) || 0,
        expenses: Number(form.expenses) || 0,
        isPublic: form.isPublic,
        lead: form.lead,
        techStack: form.techStack.split(',').map(s => s.trim()).filter(s => s !== ''),
        startDate: form.startDate ? Timestamp.fromDate(new Date(form.startDate)) : null,
        endDate: form.endDate ? Timestamp.fromDate(new Date(form.endDate)) : null,
        status: form.status,
      });
      setEditMode(false);
    } catch (err) {
      console.error("Error updating project:", err);
      triggerConfirm("Error", "Could not save changes. Please check the console.", () => {});
    } finally {
      setLoading(false);
    }
  };

  const budget = Number(form.budget) || 0;
  const expenses = Number(form.expenses) || 0;
  const percentage = budget > 0 ? Math.min((expenses / budget) * 100, 100) : 0;
  const isOverBudget = expenses > budget;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Project Details</CardTitle>
          {isLead && !editMode && !isCompleted && (
            <Button onClick={() => setEditMode(true)} size="sm" variant="outline">
              Edit Settings
            </Button>
          )}
          {isCompleted && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
              Project Completed
            </span>
          )}
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-8">

          {/* --- TOP SECTION --- */}
          <div className="md:col-span-2 grid md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-lg border">
            {/* Visibility */}
            <div>
              <Label>Project Visibility</Label>
              {!editMode ? (
                <div className="flex items-center gap-2 mt-1">
                  {project.isPublic ? <Globe className="h-4 w-4 text-blue-500"/> : <Lock className="h-4 w-4 text-orange-500"/>}
                  <span className="font-medium">{project.isPublic ? 'Public' : 'Private'}</span>
                </div>
              ) : (
                <Select 
                  value={form.isPublic ? "true" : "false"} 
                  onValueChange={(val) => setForm({ ...form, isPublic: val === "true" })}
                >
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Private (Members Only)</SelectItem>
                    <SelectItem value="true">Public (Visible to Everyone)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Project Lead */}
            <div>
              <Label>Project Lead</Label>
              {!editMode ? (
                <div className="flex items-center gap-2 mt-1">
                  <AvatarForId uid={project.lead} members={members} />
                  <span className="font-medium">{members.find(m => m.id === project.lead)?.displayName || 'Unknown'}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Select value={form.lead} onValueChange={(val) => setForm({ ...form, lead: val })}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.lead !== currentUser?.uid && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Warning: You will lose edit access.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* --- Project Status (New) --- */}
            {editMode && (
              <div>
                <Label>Project Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm({ ...form, status: val as Project['status'] })}
                >
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="onHold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* --- FINANCIALS --- */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between items-end">
              <Label className="flex items-center gap-2"><Wallet className="h-4 w-4"/> Financial Overview</Label>
              <span className={`text-sm font-mono ${isOverBudget ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                ${expenses.toLocaleString()} / ${budget.toLocaleString()}
              </span>
            </div>
            <div className="h-4 w-full bg-secondary rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {editMode && (
              <div className="grid grid-cols-2 gap-4 mt-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Budget ($)</p>
                  <Input 
                    type="number" 
                    value={form.budget?.toString() ?? ''} 
                    onChange={(e) => setForm({ ...form, budget: (e.target.value) })} 
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expenses Spent ($)</p>
                  <Input 
                    type="number" 
                    value={form.expenses?.toString() ?? ''} 
                    onChange={(e) => setForm({ ...form, expenses: Number(e.target.value) })} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* --- DETAILS --- */}
          <div className="md:col-span-2">
            <Label>Project Name</Label>
            {!editMode ? (
              <p className="text-xl font-semibold mt-1">{project.name}</p>
            ) : (
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            )}
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            {!editMode ? (
              <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{project.description}</p>
            ) : (
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            )}
          </div>
          <div>
            <Label className="flex items-center gap-2"><Calendar className="h-4 w-4"/> Timeline</Label>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-3 items-center">
                <span className="text-sm text-muted-foreground">Start:</span>
                {!editMode ? (
                  <span className="col-span-2 font-medium">{project.startDate?.toDate().toLocaleDateString() || 'N/A'}</span>
                ) : (
                  <Input type="date" className="col-span-2" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                )}
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-sm text-muted-foreground">End:</span>
                {!editMode ? (
                  <span className="col-span-2 font-medium">{project.endDate?.toDate().toLocaleDateString() || 'N/A'}</span>
                ) : (
                  <Input type="date" className="col-span-2" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                )}
              </div>
            </div>
          </div>
          <div>
            <Label className="flex items-center gap-2"><Code className="h-4 w-4"/> Tech Stack</Label>
            <div className="mt-2">
              {!editMode ? (
                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((tech, i) => (
                    <span key={i} className="bg-secondary px-2 py-1 rounded-md text-xs font-mono border">
                      {tech}
                    </span>
                  ))}
                  {!project.techStack?.length && <span className="text-sm text-muted-foreground">No stack defined</span>}
                </div>
              ) : (
                <div>
                  <Input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
                  <p className="text-xs text-muted-foreground mt-1">Separate by commas</p>
                </div>
              )}
            </div>
          </div>

          {/* --- ACTIONS --- */}
          {isLead && editMode && (
            <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t">
              <Button variant="ghost" onClick={() => setEditMode(false)} disabled={loading}>Cancel</Button>
              <Button 
                onClick={() => triggerConfirm(
                  "Save Changes?",
                  "Are you sure you want to save these changes?",
                  handleSave
                )} 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- RATING & TASKBOARD LOGIC --- */}
      {isCompleted && currentUser ? (
        <TeamRatingCard 
          projectId={project.id} 
          members={members} 
          currentUserId={currentUser.uid}
        />
      ) : (
        <TaskBoard 
          leadUID={project.lead} 
          tasks={tasks} 
          projectId={project.id} 
          members={members} 
          milestones={milestones}
        />
      )}

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogContent.title}
        description={dialogContent.description}
        onConfirm={dialogContent.action}
      />
    </div>
  )
}

// ---
// --- HELPER COMPONENTS (All go in this file) ---
// ---

const AvatarForId = ({ uid, members }: { uid: string, members: UserProfileWithId[] }) => {
  const member = members.find(m => m.id === uid);
  if(!member) return null;
  
  return (
      <Avatar className="h-6 w-6 border-white border-2">
         <AvatarImage src={member.photoURL} alt={member.displayName} />
         <AvatarFallback className="text-[10px]">
           {member.displayName?.charAt(0).toUpperCase()}
         </AvatarFallback>
      </Avatar>
  )
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: (() => void) | null;
}

function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            onConfirm?.();
            onOpenChange(false);
          }}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}