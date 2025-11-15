'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebaseConfig';
import {
  signInWithEmailAndPassword,
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
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(error.message || 'Failed to log in');
      }
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
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to sync user profile.');
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50/40 via-violet-50/30 to-peach-50 dark:from-black dark:via-black dark:to-slate-900">
     
      <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-8 z-20">
        <h2 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
          Collab<span className="text-cyan-500 dark:text-cyan-400 font-extrabold text-4xl">Hub</span>
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
              <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              <CardTitle className="text-2xl text-black dark:text-white">Welcome back</CardTitle>
            </div>
            <CardDescription>
              Log in to access your projects and tasks.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <span>Log in with Google</span>
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

            <form onSubmit={handleLogin} className="space-y-4 text-black">
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
                {loading ? 'Logging in...' : 'Log In'}
              </Button>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
