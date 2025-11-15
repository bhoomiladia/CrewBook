import React, { useState, useMemo } from 'react';
import { UserProfileWithId } from '@/hooks/data/useProjectData';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Mail, Loader2, CheckCircle, Search } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/firebaseConfig";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { useAllUsers } from "@/hooks/data/useAllUsers";

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
  
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());

  const { users: allUsers, loading: loadingUsers } = useAllUsers();

  const usersToInvite = useMemo(() => {
    const memberIds = new Set(members.map(m => m.id));
    return allUsers
      .filter(user => !memberIds.has(user.id))
      .filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allUsers, members, searchTerm]);

  const handleInvite = async (targetUser: UserProfileWithId) => {
    if (!currentUser || !projectId) return;

    setInvitingUserId(targetUser.id);

    try {
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

      setInvitedUserIds(prev => new Set(prev).add(targetUser.id));

    } catch (err) {
      console.error("Error sending invite:", err);
    } finally {
      setInvitingUserId(null);
    }
  };
  
  const onOpenChange = (open: boolean) => {
    if (!open) {
      setSearchTerm("");
      setInvitedUserIds(new Set());
    }
    setIsOpen(open);
  };

  return (
    <div>
      {isLead && (
        <div className="flex justify-end mb-4">
          <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white rounded-lg border-2 border-black hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            {/* Styled Dialog */}
            <DialogContent className="sm:max-w-md bg-white border-2 border-black rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-black">Invite Team Member</DialogTitle>
              </DialogHeader>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8 bg-white border-2 border-black rounded-lg placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2 pr-4">
                  {loadingUsers ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : usersToInvite.length === 0 ? (
                    <p className="text-center text-sm text-gray-600 py-4">
                      No users found.
                    </p>
                  ) : (
                    usersToInvite.map(user => {
                      const isInvited = invitedUserIds.has(user.id);
                      const isLoading = invitingUserId === user.id;

                      return (
                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
                          <Avatar className="h-8 w-8 border-2 border-black">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-black">{user.displayName}</p>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant={isInvited ? "outline" : "default"}
                            onClick={() => handleInvite(user)}
                            disabled={isLoading || isInvited}
                            className={`w-24 rounded-lg ${
                              isInvited
                                ? 'border-2 border-black text-black' 
                                : 'bg-black text-white border-2 border-black hover:bg-gray-800'
                            }`}
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

      {/* --- Member List --- */}
      <div className="grid md:grid-cols-3 gap-4">
        {members.map(user => (
          <Card key={user.id} className="bg-white border-2 border-black rounded-lg">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="border-2 border-black">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold flex items-center gap-2 text-black">
                  {user.displayName}
                  {user.id === leadUID && (
                    <span className="text-[10px] uppercase font-bold text-black bg-gray-200 border border-black px-1.5 py-0.5 rounded">
                      Lead
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}