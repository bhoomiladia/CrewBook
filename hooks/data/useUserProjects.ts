// hooks/data/useUserProjects.ts
import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Project } from '@/lib/types';

/**
 * Fetches all projects where the user is a member, in real-time.
 * @param uid The logged-in user's ID
 */
export function useUserProjects(uid: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return; // No user, so no projects
    }

    setLoading(true);
    // Query the 'projects' collection...
    const q = query(
      collection(db, 'projects'),
      // ...where the 'members' array contains the user's ID
      where('members', 'array-contains', uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      // THIS IS WHERE YOU WILL SEE THE INDEX ERROR IN YOUR CONSOLE
      console.error("Error fetching projects (Check Firestore Indexes): ", error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [uid]); // Rerun if the user ID changes

  return { projects, loading };
}