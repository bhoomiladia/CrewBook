// 1. Imports for both components
import React, { useRef, useEffect } from 'react';
import { motion } from "motion/react";
import { Kanban, Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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


// 3. Main TaskBoardSection component
export function TaskBoardSection() {
  const kanbanTasks = {
    todo: [
      { id: 1, title: "Design system update", priority: "high", assignee: "SC", color: "bg-gradient-to-br from-cyan-300 to-blue-400 dark:from-cyan-500/40 dark:to-blue-600/40" },
      { id: 2, title: "User research interviews", priority: "medium", assignee: "EP", color: "bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-500/40 dark:to-emerald-600/40" },
    ],
    inProgress: [
      { id: 3, title: "Homepage wireframes", priority: "high", assignee: "MR", color: "bg-gradient-to-br from-violet-300 to-purple-400 dark:from-violet-500/40 dark:to-purple-600/40" },
      { id: 4, title: "Component library", priority: "medium", assignee: "SC", color: "bg-gradient-to-br from-cyan-300 to-blue-400 dark:from-cyan-500/40 dark:to-blue-600/40" },
    ],
    done: [
      { id: 5, title: "Brand guidelines", priority: "low", assignee: "JW", color: "bg-gradient-to-br from-rose-300 to-pink-400 dark:from-rose-500/40 dark:to-pink-600/40" },
    ],
  };

  return (
    // 4. Set section to relative, add dark bg, and force dark mode
    <section className="relative w-full py-24 overflow-hidden bg-[#060010] dark">

      {/* 5. The Background Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='#333' // Darker border
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-violet-500/20 border border-violet-500/20">
            <Kanban className="w-4 h-4 text-violet-400" />
            <span className="text-violet-300">Flexible Task Management</span>
          </div>
          <h2 className="text-4xl text-slate-100 mb-4 font-bold">
            Visualize Work Your Way
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Switch seamlessly between Kanban boards and Gantt charts to match your 
            team's preferred workflow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          {/* (Updated card styles for dark background) */}
          <Card className="p-8 bg-slate-800/80 backdrop-blur-sm border-violet-500/20 rounded-3xl shadow-lg shadow-violet-900/30">
            <Tabs defaultValue="kanban" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-100 font-semibold">Website Redesign Q1</h3>
                <TabsList className="bg-slate-700/50 rounded-xl border border-slate-600/30">
                  <TabsTrigger value="kanban" className="rounded-lg data-[state=active]:bg-slate-600 text-slate-300 data-[state=active]:text-white">
                    <Kanban className="w-4 h-4 mr-2" />
                    Kanban
                  </TabsTrigger>
                  <TabsTrigger value="gantt" className="rounded-lg data-[state=active]:bg-slate-600 text-slate-300 data-[state=active]:text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Gantt
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="kanban" className="mt-0">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* To Do Column */}
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-4 border border-slate-600/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Circle className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-100">To Do</span>
                      </div>
                      <Badge variant="secondary" className="rounded-full bg-slate-600/50 text-slate-300">{kanbanTasks.todo.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {kanbanTasks.todo.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-slate-600/30 rounded-xl p-4 border border-slate-500/30 cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-slate-100">{task.title}</span>
                            <Badge 
                              variant={task.priority === "high" ? "destructive" : "secondary"}
                              className="rounded-full"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className={`${task.color} text-white text-xs`}>
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
                            <Clock className="w-4 h-4 text-slate-500" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-2xl p-4 border border-cyan-400/30 shadow-sm shadow-cyan-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <span className="text-slate-100">In Progress</span>
                      </div>
                      <Badge className="rounded-full bg-cyan-500/30 text-cyan-300 border-0">
                        {kanbanTasks.inProgress.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {kanbanTasks.inProgress.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-slate-600/30 rounded-xl p-4 border border-cyan-500/30 cursor-pointer shadow-sm shadow-cyan-500/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-slate-100">{task.title}</span>
                            <Badge 
                              variant={task.priority === "high" ? "destructive" : "secondary"}
                              className="rounded-full"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className={`${task.color} text-white text-xs`}>
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
                            <Clock className="w-4 h-4 text-cyan-400" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Done Column */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl p-4 border border-green-400/30 shadow-sm shadow-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-slate-100">Done</span>
                      </div>
                      <Badge className="rounded-full bg-green-500/30 text-green-300 border-0">
                        {kanbanTasks.done.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {kanbanTasks.done.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-slate-600/30 rounded-xl p-4 border border-green-500/30 cursor-pointer shadow-sm shadow-green-500/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-slate-100 line-through opacity-60">{task.title}</span>
                            <Badge variant="secondary" className="rounded-full bg-slate-600/50 text-slate-300">
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className={`${task.color} text-white text-xs`}>
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gantt" className="mt-0">
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30">
                  <div className="space-y-4">
                    {/* Gantt timeline header */}
                    <div className="grid grid-cols-12 gap-2 mb-4 pb-4 border-b border-slate-600/60">
                      <div className="col-span-3 text-slate-300">Task</div>
                      <div className="col-span-9 grid grid-cols-7 gap-1 text-center text-slate-400">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </div>

                    {/* Gantt rows */}
                    {[
                      { task: "Design system update", start: 0, duration: 3, color: "bg-gradient-to-r from-cyan-500/60 to-blue-600/60 shadow-sm shadow-cyan-500/20" },
                      { task: "Homepage wireframes", start: 2, duration: 4, color: "bg-gradient-to-r from-violet-500/60 to-purple-600/60 shadow-sm shadow-violet-500/20" },
                      { task: "Component library", start: 4, duration: 2, color: "bg-gradient-to-r from-green-500/60 to-emerald-600/60 shadow-sm shadow-green-500/20" },
                      { task: "User research", start: 1, duration: 5, color: "bg-gradient-to-r from-rose-500/60 to-pink-600/60 shadow-sm shadow-rose-500/20" },
                    ].map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3 text-slate-100">{item.task}</div>
                        <div className="col-span-9 grid grid-cols-7 gap-1 relative h-8">
                          <div
                            className={`${item.color} rounded-lg absolute h-8`}
                            style={{
                              left: `${(item.start / 7) * 100}%`,
                              width: `${(item.duration / 7) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-cyan-500/20 border border-cyan-500/20">
                <Kanban className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-slate-100 mb-2 font-semibold">Drag & Drop</h3>
              <p className="text-slate-400">
                Intuitive drag-and-drop interface makes task management effortless
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-green-500/20 border border-green-500/20">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-slate-100 mb-2 font-semibold">Timeline View</h3>
              <p className="text-slate-400">
                Visualize project timelines and dependencies with Gantt charts
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-violet-500/20 border border-violet-500/20">
                <CheckCircle2 className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-slate-100 mb-2 font-semibold">Custom Workflows</h3>
              <p className="text-slate-400">
                Create custom columns and statuses that match your process
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}