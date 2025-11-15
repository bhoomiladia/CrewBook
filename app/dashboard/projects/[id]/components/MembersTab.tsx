import React, { useState, useMemo } from 'react';
import { UserProfileWithId } from '@/hooks/data/useProjectData';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; // <-- Import ScrollArea
import { Plus, Mail, Loader2, CheckCircle, Search } from 'lucide-react'; // <-- Import Search
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/firebaseConfig";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { useAllUsers } from "@/hooks/data/useAllUsers"; // <-- Import new hook

interface Props {
  members: UserProfileWithId[];
  leadUID: string;
  projectId?: string;
  name?: string;
}

export function MembersTab({ members, leadUID, projectId, name = "Project" }: Props) {
  const { currentUser } = useAuth();
  const isLead = currentUser?.uid === leadUID;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for invite logic
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null); // Tracks loading
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set()); // Tracks success

  // Get all users in the system
  const { users: allUsers, loading: loadingUsers } = useAllUsers();

  // Filter out users who are already members or don't match the search
  const usersToInvite = useMemo(() => {
    const memberIds = new Set(members.map(m => m.id));
    return allUsers
      .filter(user => !memberIds.has(user.id)) // Not already a member
      .filter(user => // Matches search term
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allUsers, members, searchTerm]);

  // This function is now called by clicking the button next to a user
  const handleInvite = async (targetUser: UserProfileWithId) => {
    if (!currentUser || !projectId) return;

    setInvitingUserId(targetUser.id); // Set loading state for this specific user

    try {
      // 1. Create Notification
      await addDoc(collection(db, "notifications"), {
        recipientId: targetUser.id,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "The Lead",
        type: "PROJECT_INVITE",
        projectId: projectId,
        projectName: name,
        message: `Invited you to join ${name}`,
        status: "unread",
        createdAt: serverTimestamp(),
      });

      // 2. Add to "invited" list to change button state
      setInvitedUserIds(prev => new Set(prev).add(targetUser.id));

    } catch (err) {
      console.error("Error sending invite:", err);
    } finally {
      setInvitingUserId(null); // Clear loading state
    }
  };
  
  // Reset search when dialog closes
  const onOpenChange = (open: boolean) => {
    if (!open) {
      setSearchTerm("");
      setInvitedUserIds(new Set()); // Clear invited list
    }
    setIsOpen(open);
  };

  return (
    <div>
      {isLead && (
        <div className="flex justify-end mb-4">
          <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* User List */}
              <ScrollArea className="h-64">
                <div className="space-y-2 pr-4">
                  {loadingUsers ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : usersToInvite.length === 0 ? (
                     <p className="text-center text-sm text-muted-foreground py-4">
                       No users found.
                     </p>
                  ) : (
                    usersToInvite.map(user => {
                      const isInvited = invitedUserIds.has(user.id);
                      const isLoading = invitingUserId === user.id;

                      return (
                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant={isInvited ? "outline" : "default"}
                            onClick={() => handleInvite(user)}
                            disabled={isLoading || isInvited}
                            className="w-24"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isInvited ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Invited
                              </>
                            ) : (
                              "Invite"
                            )}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* --- Member List (Unchanged) --- */}
      <div className="grid md:grid-cols-3 gap-4">
        {members.map(user => (
          <Card key={user.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold flex items-center gap-2">
                  {user.displayName}
                  {user.id === leadUID && (
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Lead</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}