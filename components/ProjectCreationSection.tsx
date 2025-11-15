import { motion } from "motion/react";
import { FolderPlus, UserPlus, Settings, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function ProjectCreationSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-violet-50/30 via-green-50/20 to-peach-50/30 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/60 dark:bg-green-500/20 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
            <FolderPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300">Quick Project Setup</span>
          </div>
          <h2 className="text-4xl text-slate-900 dark:text-slate-100 mb-4">
            Launch Projects in Minutes
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            AI-assisted project creation helps you set up teams, define roles, and 
            establish workflows faster than ever.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-500/20 dark:to-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">AI-Powered Templates</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Smart templates suggest task breakdowns, timelines, and resource allocation 
                  based on your project type and team size.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                <UserPlus className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Smart Team Assembly</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Automatically match team members to projects based on skills, availability, 
                  and workload balance for optimal collaboration.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-500/20 dark:to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
                <Settings className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Flexible Workflows</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Customize collaboration rules, approval processes, and notification preferences 
                  to fit your team's unique workflow.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-green-100/50 dark:border-green-500/20 rounded-3xl shadow-lg shadow-green-200/30 dark:shadow-green-900/30">
              <div className="mb-6">
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Create New Project</h3>
                <p className="text-slate-600 dark:text-slate-400">Set up your team and get started</p>
              </div>

              {/* Project name input */}
              <div className="mb-6">
                <label className="text-slate-700 dark:text-slate-300 mb-2 block">Project Name</label>
                <div className="bg-slate-50/80 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/30 rounded-xl px-4 py-3 shadow-sm shadow-slate-200/50 dark:shadow-none">
                  <span className="text-slate-900 dark:text-slate-100">Website Redesign Q1</span>
                </div>
              </div>

              {/* Template selection */}
              <div className="mb-6">
                <label className="text-slate-700 dark:text-slate-300 mb-2 block">Template</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-500/20 dark:to-blue-600/20 border-2 border-cyan-300 dark:border-cyan-400/50 rounded-xl p-4 cursor-pointer shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                    <FolderPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-2" />
                    <span className="text-slate-900 dark:text-slate-100 block">Design Project</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/30 rounded-xl p-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500/50">
                    <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400 mb-2" />
                    <span className="text-slate-600 dark:text-slate-400 block">Development</span>
                  </div>
                </div>
              </div>

              {/* Team members */}
              <div className="mb-6">
                <label className="text-slate-700 dark:text-slate-300 mb-3 block">Team Members</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-full pl-1 pr-4 py-1 border border-slate-200/50 dark:border-slate-600/30 shadow-sm shadow-slate-200/50 dark:shadow-none">
                    <Avatar className="w-8 h-8 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-900/30">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-300 to-blue-400 dark:from-cyan-500/40 dark:to-blue-600/40 text-white">SC</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900 dark:text-slate-100">Sarah Chen</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-full pl-1 pr-4 py-1 border border-slate-200/50 dark:border-slate-600/30 shadow-sm shadow-slate-200/50 dark:shadow-none">
                    <Avatar className="w-8 h-8 shadow-sm shadow-green-200/50 dark:shadow-green-900/30">
                      <AvatarFallback className="bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-500/40 dark:to-emerald-600/40 text-white">MR</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900 dark:text-slate-100">Mike Rodriguez</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-full pl-1 pr-4 py-1 border border-slate-200/50 dark:border-slate-600/30 shadow-sm shadow-slate-200/50 dark:shadow-none">
                    <Avatar className="w-8 h-8 shadow-sm shadow-violet-200/50 dark:shadow-violet-900/30">
                      <AvatarFallback className="bg-gradient-to-br from-violet-300 to-purple-400 dark:from-violet-500/40 dark:to-purple-600/40 text-white">EP</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900 dark:text-slate-100">Emily Park</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-700/50">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </div>

              {/* AI suggestion */}
              <div className="bg-gradient-to-r from-green-50/80 to-cyan-50/80 dark:from-green-500/20 dark:to-cyan-600/20 border border-green-200/50 dark:border-green-400/30 rounded-xl p-4 mb-6 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-500/60 dark:to-emerald-600/60 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-300/50 dark:shadow-green-500/30">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-100 block mb-1">AI Suggestion</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Based on your team's skills, we recommend adding 2 developers and 1 QA specialist for optimal results.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 hover:from-green-500 hover:to-emerald-600 dark:hover:from-green-400 dark:hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-green-200/50 dark:shadow-green-500/30 border-0">
                Create Project
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
