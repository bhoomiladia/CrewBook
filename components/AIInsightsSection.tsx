import { motion } from "motion/react";
import { Brain, TrendingUp, Target, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export function AIInsightsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-lavender-50/40 via-cyan-50/30 to-stone-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100/60 dark:bg-violet-500/20 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
            <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-violet-700 dark:text-violet-300">AI-Powered Intelligence</span>
          </div>
          <h2 className="text-4xl text-slate-900 dark:text-slate-100 mb-4">
            Insights That Drive Results
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            Let AI analyze your team's patterns and provide actionable recommendations 
            to improve productivity and collaboration.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Dashboard */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-violet-100/50 dark:border-violet-500/20 rounded-3xl shadow-lg shadow-violet-200/30 dark:shadow-violet-900/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-300 to-purple-400 dark:from-violet-500/40 dark:to-purple-600/40 rounded-xl flex items-center justify-center shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-slate-100">AI Insights Dashboard</h3>
                    <p className="text-slate-600 dark:text-slate-400">Real-time analytics</p>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-500/20 dark:to-emerald-600/20 rounded-2xl p-4 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300">Productivity</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-900 dark:text-slate-100 text-3xl">87%</span>
                      <Badge className="bg-green-400 dark:bg-green-500/60 text-white rounded-full border-0 shadow-sm shadow-green-300/50 dark:shadow-green-500/30">+12%</Badge>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-2xl p-4 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-cyan-700 dark:text-cyan-300">On Track</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-900 dark:text-slate-100 text-3xl">94%</span>
                      <Badge className="bg-cyan-400 dark:bg-cyan-500/60 text-white rounded-full border-0 shadow-sm shadow-cyan-300/50 dark:shadow-cyan-500/30">+5%</Badge>
                    </div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-700 dark:text-slate-300">Task Completion Rate</span>
                      <span className="text-slate-900 dark:text-slate-100">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-700 dark:text-slate-300">Team Collaboration</span>
                      <span className="text-slate-900 dark:text-slate-100">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-700 dark:text-slate-300">Response Time</span>
                      <span className="text-slate-900 dark:text-slate-100">76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-violet-50/80 to-blue-50/80 dark:from-violet-500/20 dark:to-blue-600/20 border-violet-200/50 dark:border-violet-400/30 rounded-3xl shadow-lg shadow-violet-200/30 dark:shadow-violet-500/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-500/60 dark:to-purple-600/60 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-300/50 dark:shadow-violet-500/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-slate-100 mb-1">Smart Recommendations</h3>
                    <p className="text-slate-600 dark:text-slate-400">AI-generated suggestions for your team</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/80 dark:bg-slate-700/50 rounded-xl p-4 border border-violet-200/50 dark:border-violet-500/30 shadow-sm shadow-violet-100/50 dark:shadow-none">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-violet-400 dark:bg-violet-400/80 rounded-full mt-2 flex-shrink-0 shadow-sm shadow-violet-300/50 dark:shadow-violet-500/30" />
                      <div>
                        <span className="text-slate-900 dark:text-slate-100 block mb-1">Reallocate design tasks</span>
                        <p className="text-slate-600 dark:text-slate-400">Sarah is at 85% capacity. Consider moving 2 tasks to Emily who's at 45%.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-700/50 rounded-xl p-4 border border-violet-200/50 dark:border-violet-500/30 shadow-sm shadow-violet-100/50 dark:shadow-none">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 dark:bg-cyan-400/80 rounded-full mt-2 flex-shrink-0 shadow-sm shadow-cyan-300/50 dark:shadow-cyan-500/30" />
                      <div>
                        <span className="text-slate-900 dark:text-slate-100 block mb-1">Schedule team sync</span>
                        <p className="text-slate-600 dark:text-slate-400">3 blockers detected. A 30-minute sync could resolve these issues.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right: Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-500/20 dark:to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
                <Brain className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Predictive Analytics</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  AI analyzes historical data to predict project timelines, identify potential 
                  bottlenecks, and suggest optimal resource allocation before issues arise.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-500/20 dark:to-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Performance Trends</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Track team velocity, burndown rates, and productivity patterns over time. 
                  Get automated reports highlighting improvements and areas for growth.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                <Sparkles className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Smart Suggestions</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Receive personalized recommendations for task assignments, meeting schedules, 
                  and workflow optimizations based on your team's work patterns.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-500/20 dark:to-pink-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-200/50 dark:shadow-rose-500/20">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Risk Detection</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Early warning system identifies projects at risk of delays, team members 
                  approaching burnout, and tasks that may need additional resources.
                </p>
              </div>
            </div>

            <Card className="p-6 bg-gradient-to-br from-slate-800 to-indigo-900 dark:from-slate-700/80 dark:to-indigo-800/80 rounded-3xl shadow-lg shadow-indigo-300/30 dark:shadow-indigo-500/30 border-0">
              <div className="flex items-start gap-4 text-white">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-white/20">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white mb-2">Automated Insights</h3>
                  <p className="text-blue-100 dark:text-cyan-200">
                    Our AI continuously learns from your team's workflow and automatically 
                    surfaces insights without any manual configuration required.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
