'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Firebase Imports
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/hooks/useAuth';

// UI Imports
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';

// --- CONTEXT FETCHING ---
async function fetchUserProjects(userId: string) {
  try {
    const q = query(collection(db, 'projects'), where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

async function fetchPublicProjects() {
  try {
    const q = query(collection(db, 'projects'), where('isPublic', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

async function fetchUserTasks(userId: string) {
  try {
    // Note: This query requires a composite index in Firestore
    // (tasks collection, assignedTo ==, status !=)
    const q = query(
      collection(db, 'tasks'), 
      where('assignedTo', '==', userId),
      where('status', '!=', 'done')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

async function fetchAllUsers() {
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      displayName: doc.data().displayName || 'Unknown',
      skills: doc.data().skills || [],
    }));
  } catch (e) { return []; }
}

// --- MAIN COMPONENT ---

export function Chatbot() {
  const { currentUser, userProfile } = useAuth();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { messages, input, setInput, handleInputChange, append, isLoading } = useChat({
    api: '/api/chat',
    streamProtocol: 'text',
    onError: (error) => {
      console.error("Chat Error:", error);
      setErrorMsg("Something went wrong. Please try again.");
    },
  });

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, errorMsg]);

  const handleSmartSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;

    const userMessage = input.trim();
    setInput('');
    setErrorMsg(null);

    try {
      // 1. Fetch Context
      const [myProjects, publicProjects, tasks, allUsers] = await Promise.all([
        fetchUserProjects(currentUser.uid),
        fetchPublicProjects(),
        fetchUserTasks(currentUser.uid),
        fetchAllUsers(),
      ]);

      // 2. Merge Projects (Your fix was correct)
      const projectMap = new Map();
      const safeMyProjects = Array.isArray(myProjects) ? myProjects : [];
      const safePublicProjects = Array.isArray(publicProjects) ? publicProjects : [];
      
      [...safeMyProjects, ...safePublicProjects].forEach((p: any) => {
        if (p?.id) projectMap.set(p.id, p);
      });

      const allProjects = Array.from(projectMap.values());

      // 3. Send
      await append({
        role: 'user',
        content: userMessage,
      }, {
        data: {
          dataContext: JSON.stringify({
            currentUserId: currentUser.uid,
            userProfile: {
              displayName: userProfile?.displayName || 'User',
            },
            currentPage: pathname,
            projects: allProjects,
            tasks: tasks,
            potentialCollaborators: allUsers,
          }),
        },
      });
    } catch (err) {
      console.error('Failed to send:', err);
      setErrorMsg("Failed to send message.");
      setInput(userMessage);
    }
  };


  return (
    // --- 1. THEME: Re-wrapped in <aside> and applied theme ---
    <aside className="flex flex-col h-full bg-white text-black">
      {/* HEADER */}
      <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold text-base uppercase tracking-wider">CollabBot</h2>
        </div>
      </div>

      {/* MESSAGES */}
      {/* --- 2. THEME: Set chat background to match dashboard --- */}
      <div className="flex-1 overflow-hidden relative bg-green-50 bg-notebook-grid">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6">
            
            {messages.length === 0 && !errorMsg && (
              <div className="text-center text-gray-500 mt-10 px-2">
                <Bot className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  Hi! I'm ready to help with your projects and tasks.
                </p>
              </div>
            )}

            {messages.map((m, index) => (
              <ChatMessage 
                key={m.id || index} 
                role={m.role} 
                content={m.content} 
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse ml-10">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-100 text-red-700 text-xs border border-red-300">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t-2 border-black bg-white">
        <form onSubmit={handleSmartSubmit} className="relative">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            // --- 3. THEME: Styled Input ---
            className="pr-10 resize-none bg-white border-2 border-black focus-visible:ring-1 focus-visible:ring-black"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost" 
            className="absolute right-1 top-1 h-8 w-8 text-gray-500 hover:text-black"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </aside>
  );
}

// --- MESSAGE BUBBLE ---

function ChatMessage({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <Avatar className={cn(
        "h-8 w-8 shrink-0 border-2 border-black",
        isUser ? "bg-black text-white" : "bg-white text-black"
      )}>
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* --- 4. THEME: Styled Bubbles --- */}
      <div
        className={cn(
          'p-3 rounded-lg max-w-[85%] text-sm overflow-hidden shadow-[2px_2px_0px_#000]',
          isUser
            ? 'bg-black text-white rounded-tr-none border-2 border-black'
            : 'bg-white text-black rounded-tl-none border-2 border-black'
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap font-medium leading-relaxed">{content}</div>
        ) : (
          <div className="prose prose-sm max-w-none leading-relaxed break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  const isInternal = href && href.startsWith('/');
                  if (isInternal) {
                    return (
                      <Link 
                        href={href as string}
                        className="text-green-700 font-semibold hover:underline bg-green-100 px-1.5 py-0.5 rounded mx-0.5 inline-flex items-center gap-1"
                      >
                        {children}
                      </Link>
                    );
                  }
                  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{children}</a>;
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}