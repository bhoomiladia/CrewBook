'use client'

import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { 
  collection, 
  collectionGroup, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { Task, Project } from '@/lib/types'; // <-- Import Project type

/**
 * Fetches ALL tasks assigned to the user (Active AND Completed)
 * AND joins the project name onto them.
 */
export function useUserTasks(uid: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // We also need to fetch the user's projects to get their names
  const [projectsMap, setProjectsMap] = useState<Map<string, string>>(new Map());

  // Step 1: Fetch all projects the user is a member of
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', uid)
    );

    const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
      const newMap = new Map<string, string>();
      snapshot.forEach((doc) => {
        const project = doc.data() as Project;
        newMap.set(doc.id, project.name); // Map<projectId, projectName>
      });
      setProjectsMap(newMap);

      // If user has no projects, they have no tasks from them
      if (snapshot.empty) {
        setTasks([]);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching projects for tasks:", error);
      setLoading(false);
    });

    return () => unsubProjects();
  }, [uid]);

  // Step 2: Fetch all tasks assigned to the user
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    
    // If the project map isn't ready, don't query for tasks yet
    // (unless the user has 0 projects, which is handled above)
    if (projectsMap.size === 0 && loading) {
      return; 
    }

    const tasksQuery = query(
      collectionGroup(db, 'tasks'),
      where('assignedTo', '==', uid)
    );

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData: Task[] = [];
      snapshot.forEach((doc) => {
        const task = doc.data() as Task;
        tasksData.push({
          ...(doc.data() as Task),
          id: doc.id,
          // --- THIS IS THE FIX ---
          // Use the map to add the project name to the 'name' field
          name: projectsMap.get(task.projectId) || 'Unknown Project' 
        });
      });
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user tasks:", error);
      setLoading(false);
    });

    return () => unsubTasks();
  }, [uid, projectsMap, loading]); // <-- Now depends on projectsMap

  return { tasks, loading };
}