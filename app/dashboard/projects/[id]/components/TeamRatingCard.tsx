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
      // 3. Set the rating document.
      await setDoc(ratingRef, {
        raterId: currentUserId,
        ratedId: ratedMemberId,
        rating: rating,
        createdAt: serverTimestamp(),
        projectId: projectId, 
      });
      
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
      // Styled Loader Card
      <Card className="bg-white border-2 border-black rounded-lg">
        <CardHeader><CardTitle className="text-black">Loading Ratings...</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-24">
          <Loader2 className="h-5 w-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    // Styled Main Card
    <Card className="bg-white border-2 border-black rounded-lg">
      <CardHeader>
        <CardTitle className="text-black">Rate Your Teammates</CardTitle>
        <CardDescription className="text-gray-600">
          Project is complete! Rate your team to help build a culture of accountability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamToRate.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            You were the only member on this project.
          </p>
        ) : (
          teamToRate.map(member => (
            <div 
              key={member.id} 
              // Styled list item
              className="flex flex-col sm:flex-row items-center justify-between p-3 border-2 border-black rounded-lg bg-white"
            >
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                {/* Styled Avatar */}
                <Avatar className="h-8 w-8 border-2 border-black">
                  <AvatarImage src={member.photoURL} alt={member.displayName} />
                  <AvatarFallback>{member.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-black">{member.displayName}</span>
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