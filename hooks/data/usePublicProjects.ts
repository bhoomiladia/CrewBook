// hooks/data/usePublicProjects.ts
import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Project } from '@/lib/types';

/**
 * Fetches all public projects in real-time.
 */
export function usePublicProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // This query finds all projects marked as public
    const q = query(
      collection(db, 'projects'),
      where('isPublic', '==', true)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching public projects (CHECK INDEXES): ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { projects, loading };
}