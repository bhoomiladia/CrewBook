'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OnboardingPage() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();

  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!currentUser) router.push('/login');
      if (currentUser && userProfile?.onboardingComplete) router.push('/dashboard');
      if (currentUser) {
        const hasPasswordProvider = currentUser.providerData.some(
          (provider) => provider.providerId === 'password'
        );
        setShowPasswordFields(!hasPasswordProvider);
      }
    }
  }, [currentUser, userProfile, loading, router]);

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setIsSubmitting(true);

    if (showPasswordFields && password) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setIsSubmitting(false);
        return;
      }

      try {
        const credential = EmailAuthProvider.credential(currentUser.email!, password);
        await linkWithCredential(currentUser, credential);
      } catch (error: any) {
        console.error("Error linking password: ", error);
        if (error.code === 'auth/credential-already-in-use') {
          setError('This account is already linked to another user.');
        } else {
          setError('Failed to set password.');
        }
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        about,
        skills,
        onboardingComplete: true,
      });
    } catch (error) {
      console.error("Error completing onboarding: ", error);
      setError('Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading || !currentUser || (currentUser && userProfile?.onboardingComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <Card className="w-full max-w-xl shadow-md border border-border bg-card">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl font-semibold">
              Welcome, {currentUser.displayName?.split(' ')[0]}!
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Just a few more details to complete your profile.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-4">
            {/* About Me */}
            <div className="space-y-2">
              <Label htmlFor="about">About Me</Label>
              <Textarea
                id="about"
                placeholder="Tell everyone a bit about yourself..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Your Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="e.g., React, Node.js, UI/UX"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3">
                  {skills.map(skill => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer px-3 py-1 text-sm"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      {skill} <span className="ml-1.5 text-xs text-muted-foreground">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Password */}
            {showPasswordFields && (
              <div className="space-y-4 rounded-lg border border-border bg-background p-5">
                <p className="text-sm font-medium">Create a password</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You signed in with Google. To log in with your email ({currentUser.email}) later,
                  set a password below.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="password">Password (min. 6 characters)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>

          <CardFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Complete Profile & Enter'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
