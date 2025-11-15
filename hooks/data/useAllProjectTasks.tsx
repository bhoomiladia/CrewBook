'use client'

import { useState, useEffect } from 'react'
import { db } from '@/firebaseConfig'
import {
  collection,
  collectionGroup,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { Task, Project } from '@/lib/types' // <-- Import Project

// This hook fetches ALL tasks from ALL projects the user is a member of.
export function useAllProjectTasks(uid: string | undefined) {
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([]) // <-- Store full projects
  const [projectIds, setProjectIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Step 1: Find all projects the user is a member of
  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    setLoading(true)
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', uid)
    )

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const pData: Project[] = []
      const pIds: string[] = []
      snapshot.forEach((doc) => {
        pData.push({ id: doc.id, ...doc.data() } as Project)
        pIds.push(doc.id)
      })
      
      setProjects(pData) // <-- Save full project data
      setProjectIds(pIds)

      // Handle case where user has 0 projects
      if (pIds.length === 0) {
        setAllTasks([])
        setLoading(false)
      }
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid])

  // Step 2: Fetch all tasks AND join the project name
  useEffect(() => {
    if (projectIds.length === 0) {
      if (uid) setLoading(false); // Handle 0-project case
      return;
    }

    // --- Create the Project Name Lookup Map ---
    const projectMap = new Map<string, string>(
      projects.map(p => [p.id, p.name]) // Uses p.name (Project name)
    );

    const tasksQuery = query(
      collectionGroup(db, 'tasks'),
      where('projectId', 'in', projectIds.slice(0, 30))
    )

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData: Task[] = []
      snapshot.forEach((doc) => {
        
        // --- THIS IS THE FIX ---
        tasksData.push({
          ...(doc.data() as Task), // 1. Spread the data (which has 'id')
          id: doc.id,   // 2. Overwrite with the correct doc ID (Fixes 'id' error)
          name: projectMap.get(doc.data().projectId) || 'Unknown Project' // 3. Use 'name' field (Fixes 'projectName' error)
        })
      })
      setAllTasks(tasksData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching all project tasks: ", error);
      setLoading(false);
    });

    return () => unsubscribe();

  }, [projectIds, projects, uid]) // <-- Added projects & uid

  return { allTasks, loading }
}