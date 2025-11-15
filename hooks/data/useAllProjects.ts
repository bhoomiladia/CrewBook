import { useState, useEffect } from 'react'
import { db } from 'firebaseConfig' // Adjust this path to your Firebase config
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Project } from '@/lib/types'

/**
 * Fetches all projects in real-time where the user is a member.
 * Assumes your 'projects' collection has a field named 'members' (an array of user IDs).
 *
 * @param uid - The ID of the currently authenticated user.
 * @returns An object containing an array of projects and a loading state.
 */
export const useAllProjects = (uid: string | undefined) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If there's no user ID, don't query.
    if (!uid) {
      setProjects([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Query for projects where the 'members' array contains the user's ID.
    // **IMPORTANT:** Ensure your Firestore 'projects' collection uses a 'members' field.
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', uid)
    )

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[]

        setProjects(projectsData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching all projects:', error)
        setLoading(false)
      }
    )

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [uid]) // Re-run the effect if the user ID changes

  return { projects, loading }
}