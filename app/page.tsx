"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import { WorkloadSection } from "@/components/WorkloadSection";
import { ProjectCreationSection } from "@/components/ProjectCreationSection";
import { TaskBoardSection } from "@/components/TaskBoardSection";
import { AIInsightsSection } from "@/components/AIInsightsSection";
import { CommunicationSection } from "@/components/CommunicationSection";
// import { PeerReviewSection } from "@/components/PeerReviewSection";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div>
      {/* 1. REMOVED the extra wrapper divs */}
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-orange-50/20 to-violet-50/30 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900">
        
        {/* 2. INCREASED height to 100vh (from 80vh) and removed m-4 */}
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
          {/* Background Hero with the circle effect */}
          <Hero
            hoverIntensity={2}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
          />
    
          {/* 3. FIX: Added 'pointer-events-none' to the overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto pointer-events-none">
            {/* Placeholder, Heading, Subheading (these now ignore the mouse) */}
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
              A smarter way to collaborate
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2 sm:mb-4">
              CrewBook
            </h1>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-xl mb-4 sm:mb-6">
              Streamline your workflow, manage tasks effortlessly, and connect with your team like never before.
            </p>
    
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* 3. FIX: Added 'pointer-events-auto' to buttons so they are still clickable */}
              <Button
                size="sm"
                className="px-6 py-2 text-base font-semibold pointer-events-auto"
              >
                Get Started
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="px-6 py-2 text-base font-semibold dark:text-white dark:border-gray-700 dark:hover:bg-gray-800 pointer-events-auto"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* These sections come *after* the hero section */}
      <WorkloadSection />
      <ProjectCreationSection />
      <TaskBoardSection />
      <AIInsightsSection />
      <CommunicationSection />
      {/* <PeerReviewSection /> */}
    </div>
  );
}