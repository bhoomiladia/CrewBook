// hooks/data/useUserDirectory.ts
import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '@/lib/types'; // Assuming UserProfile is in types.ts

// We add 'id' (which is the uid) to the UserProfile
export type UserDirectoryEntry = UserProfile & { id: string };

/**
 * Fetches all users from the /users collection in real-time.
 */
export function useUserDirectory() {
  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: UserDirectoryEntry[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserDirectoryEntry);
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user directory: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { users, loading };
}