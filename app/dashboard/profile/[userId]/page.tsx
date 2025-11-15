'use client'

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link'; // <-- 1. ADDED IMPORT
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebaseConfig';
// --- 2. ADDED 'collection' ---
import { doc, getDoc, collectionGroup, query, where, getDocs, updateDoc, collection } from 'firebase/firestore'; 
// --- 3. ADDED 'Project' ---
import { UserProfile, UserProfileWithId, Project } from '@/lib/types'; 
import { Button } from '@/components/ui/button';
// --- 4. ADDED 'CardFooter' ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Mail, Calendar, Briefcase, Edit, Star } from 'lucide-react';

// --- This hook is pure logic and needs no theme changes ---
function useUserCollaborationScore(userId?: string) {
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
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
  }, [userId]);

  return { score, count, loading };
}

// --- 5. NEW HOOK: Fetches public projects for a specific user ---
function useUserPublicProjects(userId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const q = query(
      collection(db, 'projects'), 
      where('members', 'array-contains', userId),
      where('isPublic', '==', true)
    );

    const fetchData = async () => {
      try {
        const snapshot = await getDocs(q);
        const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching public projects:", error);
        // This query will fail without a composite index.
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  return { projects, loading };
}


export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { currentUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfileWithId | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const { score, count, loading: loadingScore } = useUserCollaborationScore(userId);
  // --- 6. CALLED NEW HOOK ---
  const { projects: publicProjects, loading: loadingProjects } = useUserPublicProjects(userId);
  
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

  // --- 7. ADDED 'loadingProjects' TO isLoading ---
  const isLoading = loadingProfile || loadingScore || loadingProjects;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-gray-600">User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* --- Profile "Cover" Card --- */}
      <Card className="overflow-hidden bg-black border-2 border-black shadow-[4px_4px_0px_#000]">
        <div className="h-32 bg-black"></div> 
        <CardContent className="relative px-6 pt-0 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 gap-4">
            <Avatar className="w-32 h-32 border-4 border-black bg-white shadow-lg">
              <AvatarImage src={profile.photoURL} alt={profile.displayName} />
              <AvatarFallback className="text-3xl text-black">
                {profile.displayName?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1 mt-2 md:mt-0">
              <h1 className="text-2xl font-bold leading-none text-white">{profile.displayName}</h1>
              <p className="text-gray-400 flex items-center gap-2">
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
          
          {/* --- Collaboration Score Card --- */}
          <Card className="bg-white border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg text-black">Collaboration Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-1 text-black">
                <span className="text-4xl font-bold">{score.toFixed(1)}</span>
                <span className="text-gray-600">/ 5</span>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <Star className={`h-4 w-4 ${score >= 1 ? 'fill-green-500' : 'fill-gray-200'}`} />
                <Star className={`h-4 w-4 ${score >= 2 ? 'fill-green-500' : 'fill-gray-200'}`} />
                <Star className={`h-4 w-4 ${score >= 3 ? 'fill-green-500' : 'fill-gray-200'}`} />
                <Star className={`h-4 w-4 ${score >= 4 ? 'fill-green-500' : 'fill-gray-200'}`} />
                <Star className={`h-4 w-4 ${score >= 5 ? 'fill-green-500' : 'fill-gray-200'}`} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Based on {count} reviews</p>
            </CardContent>
          </Card>
          
          {/* --- Details Card --- */}
          <Card className="bg-white border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg text-black">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="truncate text-black" title={profile.email}>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-black">Joined {new Date().getFullYear()}</span>
              </div>
              
              {profile.workloadStatus && (
                <div className="pt-4 border-t border-gray-100">
                   <Label className="text-xs text-gray-500 uppercase tracking-wider">Current Status</Label>
                   <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize
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
          {/* --- About Card --- */}
          <Card className="bg-white border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg text-black">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                {profile.about || "This user hasn't written a bio yet."}
              </p>
            </CardContent>
          </Card>

          {/* --- Skills Card --- */}
          <Card className="bg-white border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg text-black">Skills & Expertise</CardTitle>
              <CardDescription className="text-gray-500">Technologies and tools used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 bg-gray-100 text-black">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No skills listed.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* --- 8. NEW PUBLIC PROJECTS SECTION --- */}
          <Card className="bg-white border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg text-black">Public Projects</CardTitle>
              <CardDescription className="text-gray-500">
                Public projects this user is a member of.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                </div>
              ) : publicProjects.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No public projects found.</p>
              ) : (
                // This is the Scroll Stack container
                <div className="grid grid-flow-col auto-cols-[80%] md:auto-cols-[48%] gap-4 overflow-x-auto p-1 snap-x snap-mandatory">
                  {publicProjects.map(project => (
                    <ProjectStackCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {/* --- END OF NEW SECTION --- */}

        </div>
      </div>
    </div>
  );
}

// --- 9. NEW COMPONENT: ProjectStackCard ---
function ProjectStackCard({ project }: { project: Project }) {
  return (
    <Link href={`/dashboard/projects/${project.id}`} passHref>
      <Card className="bg-white border-2 border-black h-full flex flex-col snap-center hover:shadow-[4px_4px_0px_#000] transition-all cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-black truncate">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        </CardContent>
        <CardFooter>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-200">Public</Badge>
        </CardFooter>
      </Card>
    </Link>
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
  const [about, setAbout] = useState(profile.about || '');
  const [skillsStr, setSkillsStr] = useState(profile.skills?.join(', ') || '');

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', profile.id);
      
      const skillsArray = skillsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

      const newData = {
        displayName,
        role,
        about: about,
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
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto md:ml-0 bg-white/90 text-black border-2 border-white/90 hover:bg-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-2 border-black">
        <DialogHeader>
          <DialogTitle className="text-black">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-black">Display Name</Label>
            <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-white border-2 border-black" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-black">Job Title / Role</Label>
            <Input id="role" placeholder="e.g. Frontend Developer" value={role} onChange={e => setRole(e.target.value)} className="bg-white border-2 border-black" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio" className="text-black">About Me</Label>
            <Textarea id="bio" placeholder="Tell the team about yourself..." value={about} onChange={e => setAbout(e.target.value)} className="bg-white border-2 border-black" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="skills" className="text-black">Skills (comma separated)</Label>
            <Input 
              id="skills" 
              placeholder="React, TypeScript, Figma..." 
              value={skillsStr} 
              onChange={e => setSkillsStr(e.target.value)} 
              className="bg-white border-2 border-black"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" className="text-black hover:bg-gray-100" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-black text-white hover:bg-gray-800">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}