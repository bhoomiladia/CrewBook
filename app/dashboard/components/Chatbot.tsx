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
    const q = query(collection(db, 'tasks'), where('assignedTo', '==', userId));
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
  const [isOpen, setIsOpen] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { messages, input, setInput, handleInputChange, append, isLoading } = useChat({
    api: '/api/chat',
    streamProtocol: 'text', // Keeps compatibility with standard streams
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

      // 2. Merge Projects (Fixed Semicolons)
      const projectMap = new Map();
      const safeMyProjects = Array.isArray(myProjects) ? myProjects : [];
      const safePublicProjects = Array.isArray(publicProjects) ? publicProjects : [];

      // THIS SEMICOLON WAS MISSING, CAUSING THE ERROR:
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

  if (!isOpen) return null;

  return (
    // <aside className="w-80 border-l border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col fixed  right-0 top-14 bottom-0 z-40 shadow-xl transition-all duration-300">
      <>      {/* HEADER */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <h2 className="font-semibold text-sm">CollabBot</h2>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6">
            
            {messages.length === 0 && !errorMsg && (
              <div className="text-center text-muted-foreground mt-10 px-2">
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse ml-10">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSmartSubmit} className="relative">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="pr-10 resize-none"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost" 
            className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-primary"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
      </>

    // </aside>
  );
}

// --- MESSAGE BUBBLE ---

function ChatMessage({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'p-3 rounded-xl max-w-[85%] text-sm shadow-sm overflow-hidden',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-secondary/50 text-secondary-foreground rounded-tl-none border border-border/50'
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap font-medium leading-relaxed">{content}</div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  const isInternal = href && href.startsWith('/');
                  if (isInternal) {
                    return (
                      <Link 
                        href={href as string}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded mx-0.5 inline-flex items-center gap-1"
                      >
                        {children}
                      </Link>
                    );
                  }
                  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{children}</a>;
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