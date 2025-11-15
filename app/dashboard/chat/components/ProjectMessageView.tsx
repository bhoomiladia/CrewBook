// app/dashboard/chat/components/ProjectMessageView.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Project } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useProjectMessages } from '@/hooks/data/useProjectMessages';
import { useProjectMembers } from '@/hooks/data/useProjectMembers';
import { db } from '@/firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { MessageItem } from './MessageItem';

interface Props {
  project: Project | undefined;
}

export function ProjectMessageView({ project }: Props) {
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  
  // Fetch messages and members for the selected project
  const { messages, loading: messagesLoading } = useProjectMessages(project?.id);
  const { members, loading: membersLoading } = useProjectMembers(project?.members);

  // Ref for auto-scrolling to the bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !project || !currentUser) return;

    try {
      // Add a new document to the /projects/{projectId}/messages sub-collection
      await addDoc(collection(db, 'projects', project.id, 'messages'), {
        text: newMessage,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Select a project to start chatting.</p>
      </div>
    );
  }
  
  const isLoading = messagesLoading || membersLoading;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <header className="p-4 border-b bg-card">
        <h2 className="text-lg font-semibold">{project.name}</h2>
      </header>
      
      {/* Message List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          messages.map(msg => {
            const sender = members.find(m => m.id === msg.senderId);
            return (
              <MessageItem
                key={msg.id}
                message={msg}
                sender={sender}
                isOwnMessage={msg.senderId === currentUser?.uid}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>
      
      {/* Input Form */}
      <footer className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}