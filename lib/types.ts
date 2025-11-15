// lib/types.ts
import { Timestamp } from 'firebase/firestore';

// The user profile data stored in /users/{uid}
export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  collaborationScore: number;
  ratingCount: number;
  skills: string[];
  about?: string; 
  onboardingComplete: boolean;
  workloadStatus: 'light' | 'moderate' | 'heavy'; 
  role?: string;  
  // bio?: string;
}

export type UserProfileWithId = UserProfile & { id: string };
// The project data stored in /projects/{projectId}
export interface Project {
  id: string; // The Firestore document ID
  name: string;
  description: string;
  isPublic: boolean;
  lead: string; // UID of the team lead
  members: string[]; // Array of UIDs
  createdAt: Timestamp;
  techStack?: string[];
  budget?: string;
  expenses: number; 
  status: 'planning' | 'active' | 'onHold' | 'completed';
  startDate?: Timestamp;
  endDate?: Timestamp;
}

// The task data stored in /projects/{projectId}/tasks/{taskId}
export interface Task {
  id: string; // The Firestore document ID
  title: string;
  status: 'todo' | 'inProgress' | 'done';
  deadline: Timestamp | null;
  assignedTo: string; // UID of the assigned user
  projectId: string;
  name: string;
  milestoneId?: string | null;
}

// The milestone data stored in /projects/{projectId}/milestones/{milestoneId}
export interface Milestone {
  id: string;
  title: string;
  date: Timestamp; // Store as Firestore Timestamp
}


// --- FIX: ADD THESE TYPES FOR YOUR CREATE FORM ---
// Local types for the project creation form
export interface FormTask {
  id: string; // Local ID
  title: string;
  assigneeUid: string;
  dueDate: string; // String from date input
  milestoneId?: string;
}

export interface FormMilestone {
  id: string; // Local ID
  title: string;
  date: string; // String from date input
}