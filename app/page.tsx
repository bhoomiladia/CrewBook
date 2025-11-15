"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import { TaskBoardSection } from "@/components/TaskBoardSection";
import { WorkloadSection } from "@/components/WorkloadSection";
import { ProjectCreationSection } from "@/components/ProjectCreationSection";
import { AIInsightsSection } from "@/components/AIInsightsSection";
import { CommunicationSection } from "@/components/CommunicationSection";
// import { PeerReviewSection } from "@/components/PeerReviewSection";
import { Button } from "@/components/ui/button";
import {ThemeToggle} from "@/components/ThemeToggle";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div>
      {/* <ThemeToggle/> */}
      
      {/* *
        * FIX: Changed bg-black to bg-[#060010] to match the WorkloadSection
        *
      */}
      <div className="min-h-screen bg-[#060010] relative"> 
        
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
          {/* Background Hero with the circle effect */}
          <Hero
            hoverIntensity={2}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
          />
    
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto pointer-events-none">
            {/* Placeholder, Heading, Subheading */}
            <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
              A smarter way to collaborate
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-4">
              CrewBook
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-xl mb-4 sm:mb-6">
              Streamline your workflow, manage tasks effortlessly, and connect with your team like never before.
            </p>
    
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                size="sm"
                className="px-6 py-2 text-base font-semibold pointer-events-auto"
                onClick={() => router.push('/login')}
              >
                Get Started
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="px-6 py-2 text-base font-semibold text-white border-gray-700 hover:bg-gray-800 hover:text-white pointer-events-auto"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* *
          * REMOVED: I've deleted the gradient <div> I added before.
          * It's no longer needed now that the backgrounds match.
          *
        */}
      </div>
      
      {/* These sections come *after* the hero section */}
      <TaskBoardSection />
      <WorkloadSection />
      <ProjectCreationSection />
      
      {/* <AIInsightsSection /> */}
      {/* <CommunicationSection /> */}
      {/* <PeerReviewSection /> */}
    </div>
  );
}