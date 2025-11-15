'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebaseConfig';
import {
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      await signInWithEmailAndPassword(auth, email, password);

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign-up flow error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const idToken = await user.getIdToken();

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync user profile.');
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-in Error:', error);
      setError(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50/40 via-violet-50/30 to-peach-50 dark:from-black dark:via-black dark:to-slate-900">
    
      <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-8 z-20">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Collab<span className="text-cyan-500 dark:text-cyan-400">Hub</span>
        </h2>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="w-[400px] backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-violet-100/30 dark:shadow-violet-900/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              <CardTitle className="text-2xl text-black dark:text-white">Create your account</CardTitle>
            </div>
            <CardDescription>
              Enter your details below or sign in with Google.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Sign Up with Google
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200/50 dark:border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/90 dark:bg-slate-900/90 px-2 text-slate-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Jane Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 hover:from-cyan-500 hover:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white rounded-full shadow-md shadow-cyan-200/50 dark:shadow-cyan-500/30 border-0"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}