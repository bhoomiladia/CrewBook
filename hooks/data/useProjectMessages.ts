// hooks/data/useProjectMessages.ts
import { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

// Define the shape of a message
export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
}

/**
 * Fetches all messages for a specific project, in real-time.
 * @param projectId The ID of the project to fetch messages for
 */
export function useProjectMessages(projectId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Query the sub-collection: /projects/{projectId}/messages
    const q = query(
      collection(db, 'projects', projectId, 'messages'),
      orderBy('createdAt', 'asc') // Order by oldest first
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData: Message[] = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [projectId]); // Rerun if the projectId changes

  return { messages, loading };
}