// hooks/data/useProjectMembers.ts
import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';

// The user profile *with* their UID
export type UserProfileWithId = UserProfile & { id: string };

/**
 * Fetches the public profiles for a list of user UIDs.
 * @param uids Array of user IDs
 */
export function useProjectMembers(uids: string[] | undefined) {
  const [members, setMembers] = useState<UserProfileWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uids || uids.length === 0) {
      setLoading(false);
      return;
    }
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userPromises = uids.map(uid => getDoc(doc(db, 'users', uid)));
        const userDocs = await Promise.all(userPromises);
        const usersData = userDocs
          .filter(doc => doc.exists()) // Make sure doc exists
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as UserProfileWithId));
        setMembers(usersData);
      } catch (error) {
        console.error("Error fetching member profiles:", error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [uids]); // Re-fetch only if the list of UIDs changes

  return { members, loading };
}