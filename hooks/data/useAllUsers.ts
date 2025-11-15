import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { UserProfileWithId } from './useProjectData'; // Adjust path if needed

/**
 * Fetches all users from the 'users' collection in real-time.
 */
export function useAllUsers() {
  const [users, setUsers] = useState<UserProfileWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData: UserProfileWithId[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserProfileWithId);
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching all users: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { users, loading };
}