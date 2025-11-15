// app/api/auth/sync/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createHash } from 'crypto';
import { UserProfile } from '@/lib/types';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

function createGravatarUrl(email: string): string {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = createHash('md5').update(trimmedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

export async function POST(request: Request) {
  try {
    const authorization = (await headers()).get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!uid || !email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      return NextResponse.json({ message: 'User profile exists' }, { status: 200 });
    }

    const userProfile: Omit<UserProfile, 'about'> = {
      displayName: name || 'Google User',
      email: email,
      photoURL: picture || createGravatarUrl(email),
      workloadStatus: 'light',
      collaborationScore: 0,
      skills: [],
      onboardingComplete: false, // <-- This will send them to /onboarding
    };

    await userDocRef.set(userProfile);

    return NextResponse.json({ message: 'Profile created' }, { status: 201 });
  } catch (error: any) {
    console.error('API Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}