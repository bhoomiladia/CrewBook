import { motion } from "motion/react";
import { Users, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function WorkloadSection() {
  const teamMembers = [
    { name: "Sarah Chen", initials: "SC", workload: 85, status: "high", tasks: 12, color: "bg-gradient-to-br from-rose-300 to-pink-400 dark:from-rose-500/40 dark:to-pink-600/40" },
    { name: "Mike Rodriguez", initials: "MR", workload: 65, status: "optimal", tasks: 8, color: "bg-gradient-to-br from-cyan-300 to-blue-400 dark:from-cyan-500/40 dark:to-blue-600/40" },
    { name: "Emily Park", initials: "EP", workload: 45, status: "low", tasks: 5, color: "bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-500/40 dark:to-emerald-600/40" },
    { name: "James Wilson", initials: "JW", workload: 70, status: "optimal", tasks: 9, color: "bg-gradient-to-br from-violet-300 to-purple-400 dark:from-violet-500/40 dark:to-purple-600/40" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-stone-50 to-violet-50/30 dark:from-slate-900 dark:to-indigo-950/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100/60 dark:bg-cyan-500/20 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-cyan-700 dark:text-cyan-300">Smart Workload Management</span>
          </div>
          <h2 className="text-4xl text-slate-900 dark:text-slate-100 mb-4">
            Balance Team Capacity in Real-Time
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
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
            <Card className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-violet-100/50 dark:border-violet-500/20 rounded-3xl shadow-lg shadow-violet-200/30 dark:shadow-violet-900/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-slate-100">Team Workload Overview</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100/80 dark:bg-green-500/20 rounded-full shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300">Balanced</span>
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
                    className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl p-5 shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100/50 dark:border-slate-600/30"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <Avatar className="w-12 h-12 shadow-lg shadow-violet-200/50 dark:shadow-violet-900/30">
                        <AvatarFallback className={`${member.color} text-white`}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-900 dark:text-slate-100">{member.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 dark:text-slate-400">{member.tasks} tasks</span>
                            {member.status === "high" && (
                              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={member.workload} 
                            className="h-2 flex-1"
                            style={{
                              '--progress-background': member.status === 'high' 
                                ? '#fb7185' 
                                : member.status === 'optimal'
                                ? '#67e8f9'
                                : '#86efac'
                            } as React.CSSProperties}
                          />
                          <span className="text-slate-700 dark:text-slate-300 min-w-[3ch]">{member.workload}%</span>
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
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Real-Time Capacity Tracking</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  See everyone's workload at a glance with color-coded indicators that update 
                  automatically as tasks are assigned or completed.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-500/20 dark:to-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Overload Alerts</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Get intelligent notifications when team members approach capacity limits, 
                  helping you redistribute work before it becomes a problem.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-500/20 dark:to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
                <Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Individual Profiles</h3>
                <p className="text-slate-600 dark:text-slate-400">
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