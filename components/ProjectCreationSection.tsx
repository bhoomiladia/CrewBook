// 1. Imports for both components
import React, { useRef, useEffect } from 'react';
import { motion } from "motion/react";
import { FolderPlus, UserPlus, Settings, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

// 2. Squares component code (no 'export default')
type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface GridOffset {
  x: number;
  y: number;
}

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
}

const Squares: React.FC<SquaresProps> = ({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  hoverFillColor = '#222'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<GridOffset | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize);
          const squareY = y - (gridOffset.current.y % squareSize);

          if (
            hoveredSquareRef.current &&
            Math.floor((x - startX) / squareSize) === hoveredSquareRef.current.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquareRef.current.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, '#060010');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'left':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'up':
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'down':
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      const hoveredSquareX = Math.floor((mouseX + gridOffset.current.x - startX) / squareSize);
      const hoveredSquareY = Math.floor((mouseY + gridOffset.current.y - startY) / squareSize);

      if (
        !hoveredSquareRef.current ||
        hoveredSquareRef.current.x !== hoveredSquareX ||
        hoveredSquareRef.current.y !== hoveredSquareY
      ) {
        hoveredSquareRef.current = { x: hoveredSquareX, y: hoveredSquareY };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  return <canvas ref={canvasRef} className="w-full h-full border-none block"></canvas>;
};


// 3. Main ProjectCreationSection component
export function ProjectCreationSection() {
  return (
    // 4. Set section to relative, add dark bg, and force dark mode
    <section className="relative w-full py-24 overflow-hidden bg-[#060010] dark">
      
      {/* 5. The Background Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='#333' // Darker border for better text readability
          hoverFillColor='#222'
        />
      </div>

      {/* 6. The Content Layer - Must have relative and z-10 */}
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* (Updated styles for dark background) */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-green-500/20 border border-green-500/20">
            <FolderPlus className="w-4 h-4 text-green-400" />
            <span className="text-green-300">Quick Project Setup</span>
          </div>
          <h2 className="text-4xl text-slate-100 mb-4 font-bold">
            Launch Projects in Minutes
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            AI-assisted project creation helps you set up teams, define roles, and 
            establish workflows faster than ever.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features (Updated styles for dark bg) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-500/20">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl text-slate-100 mb-2 font-semibold">AI-Powered Templates</h3>
                <p className="text-slate-400 leading-relaxed">
                  Smart templates suggest task breakdowns, timelines, and resource allocation 
                  based on your project type and team size.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                <UserPlus className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl text-slate-100 mb-2 font-semibold">Smart Team Assembly</h3>
                <p className="text-slate-400 leading-relaxed">
                  Automatically match team members to projects based on skills, availability, 
                  and workload balance for optimal collaboration.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                <Settings className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl text-slate-100 mb-2 font-semibold">Flexible Workflows</h3>
                <p className="text-slate-400 leading-relaxed">
                  Customize collaboration rules, approval processes, and notification preferences 
                  to fit your team's unique workflow.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Mockup (Updated styles for dark bg) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-8 bg-slate-900/60 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl">
              <div className="mb-6">
                <h3 className="text-slate-100 mb-2 font-semibold">Create New Project</h3>
                <p className="text-slate-400 text-sm">Set up your team and get started</p>
              </div>

              {/* Project name input */}
              <div className="mb-5">
                <label className="text-slate-300 mb-2 block text-sm">Project Name</label>
                <div className="bg-slate-700/50 border border-slate-600/30 rounded-xl px-4 py-3 shadow-inner shadow-black/20">
                  <span className="text-slate-100">Website Redesign Q1</span>
                </div>
              </div>

              {/* Template selection */}
              <div className="mb-5">
                <label className="text-slate-300 mb-2 block text-sm">Template</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-cyan-500/20 border-2 border-cyan-400/50 rounded-xl p-4 cursor-pointer shadow-sm shadow-cyan-500/20">
                    <FolderPlus className="w-5 h-5 text-cyan-400 mb-2" />
                    <span className="text-slate-100 block text-sm font-medium">Design Project</span>
                  </div>
                  <div className="bg-slate-700/50 border border-slate-600/30 rounded-xl p-4 cursor-pointer hover:border-slate-500/50">
                    <Settings className="w-5 h-5 text-slate-400 mb-2" />
                    <span className="text-slate-400 block text-sm">Development</span>
                  </div>
                </div>
              </div>

              {/* Team members */}
              <div className="mb-5">
                <label className="text-slate-300 mb-3 block text-sm">Team Members</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2 bg-slate-700/50 rounded-full pl-1 pr-3 py-1 border border-slate-600/30">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-300 to-blue-400 text-white text-xs">SC</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-100 text-sm">Sarah Chen</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700/50 rounded-full pl-1 pr-3 py-1 border border-slate-600/30">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-gradient-to-br from-green-300 to-emerald-400 text-white text-xs">MR</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-100 text-sm">Mike Rodriguez</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700/50 rounded-full pl-1 pr-3 py-1 border border-slate-600/30">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-gradient-to-br from-violet-300 to-purple-400 text-white text-xs">EP</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-100 text-sm">Emily Park</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </div>

              {/* AI suggestion */}
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to- emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-500/30">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-slate-100 block mb-1 font-medium">AI Suggestion</span>
                    <p className="text-slate-300 text-sm">
                      Based on your team's skills, we recommend adding 2 developers and 1 QA specialist.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-xl shadow-lg shadow-green-500/30">
                Create Project
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}