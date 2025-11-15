'use client'

import React, { useEffect, useState, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebaseConfig';
import { doc, getDoc, collectionGroup, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { UserProfile, UserProfileWithId } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Mail, Calendar, Briefcase, Edit, Star } from 'lucide-react';

// --- NEW HOOK ---
// This hook calculates the score on the client
function useUserCollaborationScore(userId?: string) {
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    // This is a Collection Group Query.
    // It finds all 'ratings' documents where this user was the 'ratedId'
    const q = query(
      collectionGroup(db, 'ratings'), 
      where('ratedId', '==', userId)
    );

    const fetchData = async () => {
      try {
        const snapshot = await getDocs(q);
        let totalScore = 0;
        let ratingCount = 0;
        
        snapshot.forEach(doc => {
          totalScore += doc.data().rating;
          ratingCount++;
        });

        setCount(ratingCount);
        setScore(ratingCount > 0 ? totalScore / ratingCount : 0);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // Note: This does not listen in real-time.
    // For real-time, you'd use onSnapshot (requires paid plan or more complex rules)
    // or a Cloud Function to update the user's profile directly.
  }, [userId]);

  return { score, count, loading };
}


export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { currentUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfileWithId | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Use our new hook
  const { score, count, loading: loadingScore } = useUserCollaborationScore(userId);
  
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (currentUser && userId === currentUser.uid) {
      setIsOwner(true);
    }
  }, [currentUser, userId]);

  useEffect(() => {
    async function fetchData() {
      setLoadingProfile(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setProfile({ id: userDoc.id, ...userDoc.data() } as UserProfileWithId);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchData();
  }, [userId]);

  const isLoading = loadingProfile || loadingScore;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center">User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-violet-600"></div>
        <CardContent className="relative px-6 pt-0 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-4">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.photoURL} alt={profile.displayName} />
              <AvatarFallback className="text-3xl bg-muted">
                {profile.displayName?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1 mt-2 md:mt-0">
              <h1 className="text-2xl font-bold leading-none">{profile.displayName}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {profile.role || 'Team Member'}
              </p>
            </div>

            {isOwner && (
              <EditProfileDialog profile={profile} setProfile={setProfile} />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* --- COLLABORATION SCORE CARD --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collaboration Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{score.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-gray-300" />
                <Star className="h-4 w-4 fill-gray-300" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Based on {count} reviews</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate" title={profile.email}>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date().getFullYear()}</span>
              </div>
              
              {profile.workloadStatus && (
                <div className="pt-4 border-t">
                   <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Status</Label>
                   <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${profile.workloadStatus === 'light' ? 'bg-green-100 text-green-800' : ''}
                      ${profile.workloadStatus === 'moderate' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${profile.workloadStatus === 'heavy' ? 'bg-red-100 text-red-800' : ''}
                   `}>
                     {profile.workloadStatus}
                   </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.about|| "This user hasn't written a bio yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills & Expertise</CardTitle>
              <CardDescription>Technologies and tools used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No skills listed.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- EditProfileDialog (Modal for editing) ---
function EditProfileDialog({ 
  profile, 
  setProfile 
}: { 
  profile: UserProfileWithId, 
  setProfile: (p: UserProfileWithId) => void 
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [role, setRole] = useState(profile.role || '');
  const [bio, setBio] = useState(profile.about || '');
  const [skillsStr, setSkillsStr] = useState(profile.skills?.join(', ') || '');

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', profile.id);
      
      const skillsArray = skillsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

      const newData = {
        displayName,
        role,
        bio,
        skills: skillsArray
      };

      await updateDoc(userRef, newData);
      
      setProfile({ ...profile, ...newData });
      setOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto md:ml-0">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Job Title / Role</Label>
            <Input id="role" placeholder="e.g. Frontend Developer" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">About Me</Label>
            <Textarea id="bio" placeholder="Tell the team about yourself..." value={bio} onChange={e => setBio(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input 
              id="skills" 
              placeholder="React, TypeScript, Figma..." 
              value={skillsStr} 
              onChange={e => setSkillsStr(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}