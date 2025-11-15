'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebaseConfig';
import { 
  collection, query, where, orderBy, onSnapshot, 
  doc, updateDoc, arrayUnion, deleteDoc 
} from 'firebase/firestore';
import { Bell, Check, X, Briefcase, FileText } from 'lucide-react';

interface Notification {
  id: string;
  type: 'PROJECT_INVITE' | 'TASK_ASSIGNMENT';
  senderName: string;
  projectName?: string;
  projectId?: string;
  taskTitle?: string;
  status: 'unread' | 'read' | 'accepted';
  createdAt: any;
  message: string;
}

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notes);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAcceptInvite = async (notification: Notification) => {
    if (!currentUser || !notification.projectId) return;

    try {
      const projectRef = doc(db, 'projects', notification.projectId);
      await updateDoc(projectRef, {
        members: arrayUnion(currentUser.uid)
      });

      const noteRef = doc(db, 'notifications', notification.id);
      await updateDoc(noteRef, {
        status: 'accepted',
        message: `You joined ${notification.projectName}`
      });

    } catch (error) {
      console.error("Error joining project:", error);
    }
  };

  const handleClear = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-8 w-8 text-black" />
        <h1 className="text-3xl font-bold text-black">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 && (
          <div className="text-center py-10 text-gray-600">
            You're all caught up! No new notifications.
          </div>
        )}

        {notifications.map((note) => (
          // Styled Card
          <Card 
            key={note.id} 
            className={`bg-white border-2 border-black rounded-lg ${
              note.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Icon & Text */}
              <div className="flex items-start gap-4">
                {/* Styled Icon Container */}
                <div className="mt-1 p-2 bg-gray-100 rounded-full border-2 border-black">
                  {note.type === 'PROJECT_INVITE' ? 
                    <Briefcase className="h-5 w-5 text-blue-500" /> : 
                    <FileText className="h-5 w-5 text-orange-500" />
                  }
                </div>
                <div>
                  <h4 className="font-semibold text-base text-black">{note.message}</h4>
                  <p className="text-sm text-gray-600">
                    From {note.senderName} • {note.createdAt?.toDate().toLocaleDateString()}
                  </p>
                  {note.status === 'accepted' && (
                    // Styled Badge
                    <Badge 
                      variant="secondary" 
                      className="mt-2 text-green-600 bg-green-100 border-2 border-green-600 rounded-md"
                    >
                      Accepted
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {note.type === 'PROJECT_INVITE' && note.status !== 'accepted' && (
                  <>
                    {/* Styled Accept Button */}
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={() => handleAcceptInvite(note)}
                      className="bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800"
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    {/* Styled Decline Button */}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleClear(note.id)}
                      className="bg-white border-2 border-black rounded-lg text-black hover:bg-gray-100"
                    >
                      Decline
                    </Button>
                  </>
                )}
                
                {(note.type === 'TASK_ASSIGNMENT' || note.status === 'accepted') && (
                   // Styled Clear Button
                   <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleClear(note.id)}
                    className="text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg"
                   >
                     <X className="h-4 w-4" />
                   </Button>
                )}
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}