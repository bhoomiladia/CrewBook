import { motion } from "motion/react";
import { MessageSquare, Send, Paperclip, Smile, Hash } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

export function CommunicationSection() {
  const messages = [
    {
      id: 1,
      user: "Sarah Chen",
      initials: "SC",
      color: "bg-gradient-to-br from-cyan-300 to-blue-400 dark:from-cyan-500/40 dark:to-blue-600/40",
      message: "Just finished the wireframes for the homepage! 🎨",
      time: "2:45 PM",
    },
    {
      id: 2,
      user: "Mike Rodriguez",
      initials: "MR",
      color: "bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-500/40 dark:to-emerald-600/40",
      message: "Looking great! Can you share the Figma link?",
      time: "2:46 PM",
    },
    {
      id: 3,
      user: "Emily Park",
      initials: "EP",
      color: "bg-gradient-to-br from-violet-300 to-purple-400 dark:from-violet-500/40 dark:to-purple-600/40",
      message: "I'll start the user testing once we finalize these designs",
      time: "2:48 PM",
    },
  ];

  const channels = [
    { name: "general", unread: 0, active: false },
    { name: "design-team", unread: 3, active: true },
    { name: "development", unread: 0, active: false },
    { name: "marketing", unread: 1, active: false },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-stone-50 via-peach-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/60 dark:bg-green-500/20 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
            <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300">Seamless Communication</span>
          </div>
          <h2 className="text-4xl text-slate-900 dark:text-slate-100 mb-4">
            Keep Conversations in Context
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            Built-in chat keeps all project discussions organized and searchable, 
            eliminating the need for external messaging tools.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Chat interface mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-green-100/50 dark:border-green-500/20 rounded-3xl shadow-lg shadow-green-200/30 dark:shadow-green-900/30 overflow-hidden">
              {/* Chat header */}
              <div className="bg-gradient-to-r from-slate-800 to-indigo-900 dark:from-slate-700/80 dark:to-indigo-800/80 px-6 py-4 shadow-sm shadow-indigo-300/30 dark:shadow-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-500/60 dark:to-blue-600/60 rounded-xl flex items-center justify-center shadow-sm shadow-cyan-300/50 dark:shadow-cyan-500/30">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white">design-team</h3>
                      <p className="text-cyan-200 dark:text-cyan-300">4 members online</p>
                    </div>
                  </div>
                  <Badge className="bg-green-400 dark:bg-green-500/60 text-white rounded-full border-0 shadow-sm shadow-green-300/50 dark:shadow-green-500/30">Active</Badge>
                </div>
              </div>

              {/* Sidebar with channels */}
              <div className="flex">
                <div className="w-48 bg-slate-50/80 dark:bg-slate-700/50 border-r border-slate-200/50 dark:border-slate-600/30 p-4">
                  <h4 className="text-slate-700 dark:text-slate-300 mb-3">Channels</h4>
                  <div className="space-y-2">
                    {channels.map((channel) => (
                      <div
                        key={channel.name}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
                          channel.active 
                            ? "bg-cyan-100/80 dark:bg-cyan-500/20 border border-cyan-200/50 dark:border-cyan-400/30 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20" 
                            : "hover:bg-slate-100/80 dark:hover:bg-slate-600/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-slate-900 dark:text-slate-100">{channel.name}</span>
                        </div>
                        {channel.unread > 0 && (
                          <Badge className="bg-cyan-400 dark:bg-cyan-500/60 text-white rounded-full text-xs px-1.5 py-0 border-0 shadow-sm shadow-cyan-300/50 dark:shadow-cyan-500/30">
                            {channel.unread}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 p-6 space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0 shadow-sm shadow-violet-200/50 dark:shadow-violet-900/30">
                          <AvatarFallback className={`${msg.color} text-white`}>
                            {msg.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-slate-900 dark:text-slate-100">{msg.user}</span>
                            <span className="text-slate-500 dark:text-slate-400">{msg.time}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{msg.message}</p>
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0 shadow-sm shadow-rose-200/50 dark:shadow-rose-900/30">
                        <AvatarFallback className="bg-gradient-to-br from-rose-300 to-pink-400 dark:from-rose-500/40 dark:to-pink-600/40 text-white">JW</AvatarFallback>
                      </Avatar>
                      <div className="bg-slate-100/80 dark:bg-slate-600/50 rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 dark:bg-slate-300 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 dark:bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-slate-400 dark:bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message input */}
                  <div className="border-t border-slate-200/60 dark:border-slate-600/60 p-4">
                    <div className="flex items-center gap-2 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-200/50 dark:border-slate-600/30 shadow-sm shadow-slate-200/50 dark:shadow-none">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Paperclip className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Smile className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <Button size="icon" className="h-8 w-8 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 hover:from-cyan-500 hover:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 rounded-lg shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/30 border-0">
                          <Send className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-500/20 dark:to-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Contextual Conversations</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Every project and task has its own chat thread. Keep discussions organized 
                  and always accessible right where you need them.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                <Hash className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Smart Channels</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Create dedicated channels for teams, projects, or topics. Mentions and 
                  notifications ensure no one misses important updates.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-500/20 dark:to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
                <Paperclip className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">File Sharing</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Share files, images, and documents directly in chat. Everything is 
                  automatically linked to the relevant project and searchable.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-500/20 dark:to-pink-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-200/50 dark:shadow-rose-500/20">
                <Send className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Real-Time Updates</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Instant notifications and typing indicators keep everyone in sync. See who's 
                  online and get immediate responses when you need them.
                </p>
              </div>
            </div>

            <Card className="p-6 bg-gradient-to-br from-green-50/80 to-cyan-50/80 dark:from-green-500/20 dark:to-cyan-600/20 rounded-3xl shadow-sm shadow-green-200/50 dark:shadow-green-500/20 border-green-200/50 dark:border-green-400/30">
              <p className="text-slate-700 dark:text-slate-300 italic">
                "Having chat integrated with our tasks has completely transformed how our team 
                communicates. No more switching between apps or losing context in long email threads."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Avatar className="w-10 h-10 shadow-sm shadow-green-200/50 dark:shadow-green-900/30">
                  <AvatarFallback className="bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-500/40 dark:to-emerald-600/40 text-white">TM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-slate-900 dark:text-slate-100">Taylor Martinez</p>
                  <p className="text-slate-600 dark:text-slate-400">Product Manager</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
