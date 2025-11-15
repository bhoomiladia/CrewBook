'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Project } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/firebaseConfig'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area' 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Loader2, MessageSquareOff } from 'lucide-react'

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string; // This is the field that is sometimes undefined
  senderPhotoURL: string;
  createdAt: Timestamp;
}

export function ProjectMessageView({ project }: { project?: Project }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages for the selected project
  useEffect(() => {
    if (!project) {
      setLoading(false);
      setMessages([]);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'projects', project.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [project]);

  // Send a new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !project) return;

    await addDoc(collection(db, 'projects', project.id, 'messages'), {
      text: newMessage,
      senderId: currentUser.uid,
      // --- 2. DATABASE FIX: Add fallbacks to prevent saving 'undefined' ---
      senderName: currentUser.displayName || currentUser.email || 'Anonymous User',
      senderPhotoURL: currentUser.photoURL || '',
      createdAt: serverTimestamp(),
    });
    setNewMessage("");
  };

  // Render "Select a project" state
  if (!project) {
    return (
      <div className="flex h-full items-center justify-center bg-green-50 text-gray-600">
        <MessageSquareOff className="h-10 w-10" />
        <p className="ml-2">Select a project to start chatting.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b-2 border-black flex items-center justify-between shrink-0">
        <h3 className="text-lg font-semibold">{project.name}</h3>
      </div>

      {/* Message Area */}
      <ScrollArea className="flex-1">
        <div className="bg-green-50 p-4 space-y-4 min-h-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-700" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === currentUser?.uid;
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {/* Their Avatar */}
                  {!isMe && (
                    <Avatar className="h-8 w-8 border-2 border-black shrink-0">
                      <AvatarImage src={msg.senderPhotoURL} />
                      {/* --- 1. RENDER FIX: Use optional chaining (?.) --- */}
                      <AvatarFallback>{msg.senderName?.[0] || 'A'}</AvatarFallback>
                    </Avatar>
                  )}
                  {/* Message Bubble */}
                  <div
                    className={`p-3 rounded-lg border-2 border-black max-w-xs md:max-w-md shadow-[2px_2px_0px_#000] ${
                      isMe 
                      ? 'bg-black text-white' // My message
                      : 'bg-white text-black' // Their message
                    }`}
                  >
                    {/* --- 1. RENDER FIX: Also add a fallback here --- */}
                    {!isMe && <p className="text-xs font-semibold pb-1 text-green-700">{msg.senderName || 'Anonymous'}</p>}
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              )
            })
          )}
          {/* Empty div for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t-2 border-black bg-white flex items-center gap-3">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="bg-white border-2 border-black focus-visible:ring-1 focus-visible:ring-black"
          autoComplete="off"
        />
        <Button 
          type="submit" 
          className="bg-black text-white hover:bg-gray-800" 
          size="icon"
          disabled={!newMessage.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}