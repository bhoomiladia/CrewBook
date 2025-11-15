// app/api/signup/route.ts
import { NextResponse } from 'next/server';
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
    const { email, password, displayName } = await request.json();
    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: displayName,
    });

    // Email/Pass users have a different onboarding.
    // They already have a password, so they just need to add skills/about.
    const userProfile: Omit<UserProfile, 'about'> = {
      displayName: displayName,
      email: email,
      photoURL: createGravatarUrl(email),
      workloadStatus: 'light',
      collaborationScore: 0,
      skills: [],
      onboardingComplete: false, // <-- This will send them to /onboarding
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userProfile);

    return NextResponse.json(
      { message: 'User created successfully', uid: userRecord.uid },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Signup Error:', error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}