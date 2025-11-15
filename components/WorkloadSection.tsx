// 1. Imports for both components
import React, { useRef, useEffect } from 'react';
import { motion } from "motion/react";
import { Users, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
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


// 3. Main WorkloadSection component
export function WorkloadSection() {
  const teamMembers = [
    { name: "Sarah Chen", initials: "SC", workload: 85, status: "high", tasks: 12, color: "bg-gradient-to-br from-rose-300 to-pink-400 dark:from-rose-500/40 dark:to-pink-600/40" },
    { name: "Mike Rodriguez", initials: "MR", workload: 65, status: "optimal", tasks: 8, color: "bg-gradient-to-br from-cyan-300 to-blue-400 dark:from-cyan-500/40 dark:to-blue-600/40" },
    { name: "Emily Park", initials: "EP", workload: 45, status: "low", tasks: 5, color: "bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-500/40 dark:to-emerald-600/40" },
    { name: "James Wilson", initials: "JW", workload: 70, status: "optimal", tasks: 9, color: "bg-gradient-to-br from-violet-300 to-purple-400 dark:from-violet-500/40 dark:to-purple-600/40" },
  ];

  return (
    <section className="relative w-full py-24 overflow-hidden bg-[#060010] dark">
      
      {/* Background Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='#333' // Darker border for better text readability
          hoverFillColor='#222'
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-cyan-500/20 border border-cyan-500/20">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300">Smart Workload Management</span>
          </div>
          <h2 className="text-4xl text-slate-100 mb-4 font-bold">
            Balance Team Capacity in Real-Time
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Visual workload indicators help you distribute tasks fairly and prevent burnout 
            before it happens.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 bg-slate-900/60 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-100 font-semibold">Team Workload Overview</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/20">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">Balanced</span>
                </div>
              </div>

              <div className="space-y-6">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <Avatar className="w-10 h-10 ring-2 ring-white/10">
                        <AvatarFallback className={`${member.color} text-white font-medium text-xs`}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-200 text-sm font-medium">{member.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-xs">{member.tasks} tasks</span>
                            {member.status === "high" && (
                              <AlertCircle className="w-3 h-3 text-rose-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={member.workload} 
                            className="h-1.5 flex-1 bg-slate-700"
                            style={{
                              '--progress-background': member.status === 'high' 
                                ? '#fb7185' 
                                : member.status === 'optimal'
                                ? '#67e8f9'
                                : '#86efac'
                            } as React.CSSProperties}
                          />
                          <span className="text-slate-400 text-xs min-w-[3ch]">{member.workload}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right: Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl text-slate-100 mb-2 font-semibold">Real-Time Capacity Tracking</h3>
                <p className="text-slate-400 leading-relaxed">
                  See everyone's workload at a glance with color-coded indicators that update 
                  automatically as tasks are assigned or completed.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-500/20">
                <AlertCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl text-slate-100 mb-2 font-semibold">Overload Alerts</h3>
                <p className="text-slate-400 leading-relaxed">
                  Get intelligent notifications when team members approach capacity limits, 
                  helping you redistribute work before it becomes a problem.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl text-slate-100 mb-2 font-semibold">Individual Profiles</h3>
                <p className="text-slate-400 leading-relaxed">
                  Detailed user profiles show task history, skill sets, and performance metrics 
                  to help with smart task assignments.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}