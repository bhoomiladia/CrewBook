'use client'

import React, { useState, useEffect } from 'react';
import { db } from "@/firebaseConfig";
import { UserProfileWithId } from '@/hooks/data/useProjectData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamRatingCardProps {
  projectId: string;
  members: UserProfileWithId[];
  currentUserId: string;
}

export function TeamRatingCard({ projectId, members, currentUserId }: TeamRatingCardProps) {
  const [myRatings, setMyRatings] = useState<Map<string, number>>(new Map());
  const [loadingRatings, setLoadingRatings] = useState(true);

  // 1. Fetch ratings this user has already submitted for this project
  useEffect(() => {
    const q = query(
      collection(db, "projects", projectId, "ratings"),
      where("raterId", "==", currentUserId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRatings = new Map<string, number>();
      snapshot.forEach((doc) => {
        newRatings.set(doc.data().ratedId, doc.data().rating);
      });
      setMyRatings(newRatings);
      setLoadingRatings(false);
    });

    return () => unsubscribe();
  }, [projectId, currentUserId]);

  // 2. Handle submitting a new rating
  const handleRateMember = async (ratedMemberId: string, rating: number) => {
    // Optimistically update UI
    setMyRatings(new Map(myRatings.set(ratedMemberId, rating)));

    const ratingId = `${currentUserId}_${ratedMemberId}`;
    const ratingRef = doc(db, "projects", projectId, "ratings", ratingId);
    
    try {
      // 3. Set the rating document. This is allowed by our new rules.
      await setDoc(ratingRef, {
        raterId: currentUserId,
        ratedId: ratedMemberId,
        rating: rating,
        createdAt: serverTimestamp(),
        projectId: projectId, // Add for context
      });
      
      // 4. We are DONE. We DO NOT update the user's profile here.
      // This fixes the "Insufficient Permissions" error.

    } catch (e) {
      console.error("Error submitting rating: ", e);
      // Revert optimistic update
      setMyRatings(prev => {
        const newMap = new Map(prev);
        newMap.delete(ratedMemberId); 
        return newMap;
      });
    }
  };

  const teamToRate = members.filter(m => m.id !== currentUserId);

  if (loadingRatings) {
    return (
      <Card>
        <CardHeader><CardTitle>Loading Ratings...</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-24">
          <Loader2 className="h-5 w-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Teammates</CardTitle>
        <CardDescription>
          Project is complete! Rate your team to help build a culture of accountability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamToRate.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            You were the only member on this project.
          </p>
        ) : (
          teamToRate.map(member => (
            <div 
              key={member.id} 
              className="flex flex-col sm:flex-row items-center justify-between p-3 border rounded-lg bg-background"
            >
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.photoURL} alt={member.displayName} />
                  <AvatarFallback>{member.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.displayName}</span>
              </div>
              <StarRating
                currentRating={myRatings.get(member.id) || 0}
                onRate={(rating) => handleRateMember(member.id, rating)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// --- StarRating Helper Component ---
function StarRating({ currentRating, onRate }: {
  currentRating: number, 
  onRate: (rating: number) => void 
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            (hoverRating || currentRating) >= star
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 hover:text-gray-400'
          }`}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRate(star)}
        />
      ))}
    </div>
  );
}