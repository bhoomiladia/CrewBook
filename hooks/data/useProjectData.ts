// hooks/data/useProjectData.ts
import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { doc, collection, onSnapshot, getDoc } from 'firebase/firestore';
// --- THIS IS THE FIX (for Errors 1, 2, 7) ---
import { Project, Task, UserProfile, Milestone } from '@/lib/types';

// The user profile *with* their UID
export type UserProfileWithId = UserProfile & { id: string };

/**
 * Fetches all data for a single project in real-time.
 * @param projectId The ID of the project to fetch
 */
export function useProjectData(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [members, setMembers] = useState<UserProfileWithId[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NEW FUNCTION TO FETCH MEMBER PROFILES ---
  const fetchMemberProfiles = async (memberUIDs: string[]) => {
    try {
      const userPromises = memberUIDs.map(uid => getDoc(doc(db, 'users', uid)));
      const userDocs = await Promise.all(userPromises);
      const usersData = userDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserProfileWithId));
      setMembers(usersData);
    } catch (error) {
      console.error("Error fetching member profiles:", error);
    }
  };

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // 1. Fetch the Project document
    const projectRef = doc(db, 'projects', projectId);
    const projectUnsub = onSnapshot(projectRef, (doc) => {
      const projectData = { id: doc.id, ...doc.data() } as Project;
      setProject(projectData);
      
      if (projectData.members && projectData.members.length > 0) {
        fetchMemberProfiles(projectData.members);
      }
    });

    // 2. Fetch Tasks
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const tasksUnsub = onSnapshot(tasksRef, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    // 3. Fetch Milestones
    const milestonesRef = collection(db, 'projects', projectId, 'milestones');
    const milestonesUnsub = onSnapshot(milestonesRef, (snapshot) => {
      setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
    });
    
    setLoading(false);

    return () => {
      projectUnsub();
      tasksUnsub();
      milestonesUnsub();
    };
  }, [projectId]);

  return { project, tasks, milestones, members, loading };
}