import { motion } from "motion/react";
import { Kanban, Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";

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
    <section className="py-24 bg-gradient-to-b from-peach-50/30 to-lavender-50/40 dark:from-slate-900 dark:to-indigo-950/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100/60 dark:bg-violet-500/20 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
            <Kanban className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-violet-700 dark:text-violet-300">Flexible Task Management</span>
          </div>
          <h2 className="text-4xl text-slate-900 dark:text-slate-100 mb-4">
            Visualize Work Your Way
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
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
          <Card className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-violet-100/50 dark:border-violet-500/20 rounded-3xl shadow-lg shadow-violet-200/30 dark:shadow-violet-900/30">
            <Tabs defaultValue="kanban" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-slate-100">Website Redesign Q1</h3>
                <TabsList className="bg-slate-100/80 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/30">
                  <TabsTrigger value="kanban" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                    <Kanban className="w-4 h-4 mr-2" />
                    Kanban
                  </TabsTrigger>
                  <TabsTrigger value="gantt" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Gantt
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="kanban" className="mt-0">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* To Do Column */}
                  <div className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-600/30 shadow-sm shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Circle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <span className="text-slate-900 dark:text-slate-100">To Do</span>
                      </div>
                      <Badge variant="secondary" className="rounded-full bg-slate-200/80 dark:bg-slate-600/50">{kanbanTasks.todo.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {kanbanTasks.todo.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white/80 dark:bg-slate-600/30 rounded-xl p-4 border border-slate-200/50 dark:border-slate-500/30 cursor-pointer shadow-sm shadow-slate-200/50 dark:shadow-none"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-slate-900 dark:text-slate-100">{task.title}</span>
                            <Badge 
                              variant={task.priority === "high" ? "destructive" : "secondary"}
                              className="rounded-full"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Avatar className="w-6 h-6 shadow-sm shadow-violet-200/50 dark:shadow-violet-900/30">
                              <AvatarFallback className={`${task.color} text-white text-xs`}>
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
                            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-500/10 dark:to-blue-600/10 rounded-2xl p-4 border border-cyan-200/50 dark:border-cyan-400/30 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                        <span className="text-slate-900 dark:text-slate-100">In Progress</span>
                      </div>
                      <Badge className="rounded-full bg-cyan-200/80 dark:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 border-0">
                        {kanbanTasks.inProgress.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {kanbanTasks.inProgress.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white/80 dark:bg-slate-600/30 rounded-xl p-4 border border-cyan-200/50 dark:border-cyan-500/30 cursor-pointer shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-slate-900 dark:text-slate-100">{task.title}</span>
                            <Badge 
                              variant={task.priority === "high" ? "destructive" : "secondary"}
                              className="rounded-full"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Avatar className="w-6 h-6 shadow-sm shadow-violet-200/50 dark:shadow-violet-900/30">
                              <AvatarFallback className={`${task.color} text-white text-xs`}>
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
                            <Clock className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Done Column */}
                  <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-500/10 dark:to-emerald-600/10 rounded-2xl p-4 border border-green-200/50 dark:border-green-400/30 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                        <span className="text-slate-900 dark:text-slate-100">Done</span>
                      </div>
                      <Badge className="rounded-full bg-green-200/80 dark:bg-green-500/30 text-green-700 dark:text-green-300 border-0">
                        {kanbanTasks.done.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {kanbanTasks.done.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white/80 dark:bg-slate-600/30 rounded-xl p-4 border border-green-200/50 dark:border-green-500/30 cursor-pointer shadow-sm shadow-green-200/50 dark:shadow-green-500/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-slate-900 dark:text-slate-100 line-through opacity-60">{task.title}</span>
                            <Badge variant="secondary" className="rounded-full bg-slate-200/80 dark:bg-slate-600/50">
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Avatar className="w-6 h-6 shadow-sm shadow-violet-200/50 dark:shadow-violet-900/30">
                              <AvatarFallback className={`${task.color} text-white text-xs`}>
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
                            <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gantt" className="mt-0">
                <div className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-sm shadow-slate-200/50 dark:shadow-none">
                  <div className="space-y-4">
                    {/* Gantt timeline header */}
                    <div className="grid grid-cols-12 gap-2 mb-4 pb-4 border-b border-slate-200/60 dark:border-slate-600/60">
                      <div className="col-span-3 text-slate-700 dark:text-slate-300">Task</div>
                      <div className="col-span-9 grid grid-cols-7 gap-1 text-center text-slate-600 dark:text-slate-400">
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
                      { task: "Design system update", start: 0, duration: 3, color: "bg-gradient-to-r from-cyan-300 to-blue-400 dark:from-cyan-500/60 dark:to-blue-600/60 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20" },
                      { task: "Homepage wireframes", start: 2, duration: 4, color: "bg-gradient-to-r from-violet-300 to-purple-400 dark:from-violet-500/60 dark:to-purple-600/60 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20" },
                      { task: "Component library", start: 4, duration: 2, color: "bg-gradient-to-r from-green-300 to-emerald-400 dark:from-green-500/60 dark:to-emerald-600/60 shadow-sm shadow-green-200/50 dark:shadow-green-500/20" },
                      { task: "User research", start: 1, duration: 5, color: "bg-gradient-to-r from-rose-300 to-pink-400 dark:from-rose-500/60 dark:to-pink-600/60 shadow-sm shadow-rose-200/50 dark:shadow-rose-500/20" },
                    ].map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3 text-slate-900 dark:text-slate-100">{item.task}</div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                <Kanban className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 mb-2">Drag & Drop</h3>
              <p className="text-slate-600 dark:text-slate-400">
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-500/20 dark:to-emerald-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 mb-2">Timeline View</h3>
              <p className="text-slate-600 dark:text-slate-400">
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
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-500/20 dark:to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
                <CheckCircle2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 mb-2">Custom Workflows</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Create custom columns and statuses that match your process
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
