import { motion } from "motion/react";
import { Star, Award, ThumbsUp, MessageCircle, TrendingUp, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

export function PeerReviewSection() {
  const teamMembers = [
    {
      name: "Sarah Chen",
      initials: "SC",
      color: "bg-gradient-to-br from-cyan-300 to-blue-400 dark:from-cyan-500/40 dark:to-blue-600/40",
      score: 95,
      reviews: 24,
      strengths: ["Design", "Communication"],
    },
    {
      name: "Mike Rodriguez",
      initials: "MR",
      color: "bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-500/40 dark:to-emerald-600/40",
      score: 88,
      reviews: 19,
      strengths: ["Development", "Mentoring"],
    },
    {
      name: "Emily Park",
      initials: "EP",
      color: "bg-gradient-to-br from-violet-300 to-purple-400 dark:from-violet-500/40 dark:to-purple-600/40",
      score: 92,
      reviews: 21,
      strengths: ["Research", "Analysis"],
    },
  ];

  const recentReviews = [
    {
      reviewer: "Mike Rodriguez",
      reviewerInitials: "MR",
      reviewerColor: "bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-500/40 dark:to-emerald-600/40",
      reviewee: "Sarah Chen",
      rating: 5,
      comment: "Excellent work on the design system! Very thorough and well-documented.",
      time: "2 hours ago",
    },
    {
      reviewer: "Emily Park",
      reviewerInitials: "EP",
      reviewerColor: "bg-gradient-to-br from-violet-300 to-purple-400 dark:from-violet-500/40 dark:to-purple-600/40",
      reviewee: "James Wilson",
      rating: 4,
      comment: "Great collaboration on the research phase. Insightful findings!",
      time: "5 hours ago",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-cyan-50/30 via-peach-50/40 to-lavender-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/60 dark:bg-amber-500/20 backdrop-blur-sm rounded-full mb-4 shadow-sm shadow-amber-200/50 dark:shadow-amber-500/20">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-300">Recognition & Growth</span>
          </div>
          <h2 className="text-4xl text-slate-900 dark:text-slate-100 mb-4">
            Build a Culture of Excellence
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
            Peer reviews and collaboration scores create transparency and celebrate 
            great work while identifying opportunities for growth.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Review dashboard */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-amber-100/50 dark:border-amber-500/20 rounded-3xl shadow-lg shadow-amber-200/30 dark:shadow-amber-900/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-900 dark:text-slate-100">Team Collaboration Scores</h3>
                  <Badge className="bg-green-200/80 dark:bg-green-500/30 text-green-700 dark:text-green-300 rounded-full border-0 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8% this month
                  </Badge>
                </div>

                <div className="space-y-6">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-600/30 shadow-sm shadow-slate-200/50 dark:shadow-none"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-14 h-14 shadow-lg shadow-violet-200/50 dark:shadow-violet-900/30">
                          <AvatarFallback className={`${member.color} text-white`}>
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-900 dark:text-slate-100">{member.name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 text-amber-400 dark:text-amber-400 fill-amber-400 dark:fill-amber-400 drop-shadow-sm" />
                              <span className="text-slate-900 dark:text-slate-100">{member.score}</span>
                            </div>
                          </div>
                          <Progress value={member.score} className="h-2 mb-3" />
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {member.strengths.map((strength) => (
                                <Badge
                                  key={strength}
                                  variant="secondary"
                                  className="rounded-full text-xs bg-slate-200/80 dark:bg-slate-600/50"
                                >
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                            <span className="text-slate-600 dark:text-slate-400">{member.reviews} reviews</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-violet-100/50 dark:border-violet-500/20 rounded-3xl shadow-lg shadow-violet-200/30 dark:shadow-violet-900/30">
                <h3 className="text-slate-900 dark:text-slate-100 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {recentReviews.map((review, index) => (
                    <div key={index} className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-600/30 shadow-sm shadow-slate-200/50 dark:shadow-none">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-10 h-10 shadow-sm shadow-violet-200/50 dark:shadow-violet-900/30">
                          <AvatarFallback className={`${review.reviewerColor} text-white`}>
                            {review.reviewerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="text-slate-900 dark:text-slate-100">{review.reviewer}</span>
                              <span className="text-slate-600 dark:text-slate-400"> reviewed </span>
                              <span className="text-slate-900 dark:text-slate-100">{review.reviewee}</span>
                            </div>
                            <span className="text-slate-500 dark:text-slate-400">{review.time}</span>
                          </div>
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-amber-400 dark:text-amber-400 fill-amber-400 dark:fill-amber-400 drop-shadow-sm"
                                    : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{review.comment}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pl-[52px]">
                        <Button size="sm" variant="ghost" className="h-8 px-3 hover:bg-slate-100/80 dark:hover:bg-slate-600/50">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Helpful
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-3 hover:bg-slate-100/80 dark:hover:bg-slate-600/50">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
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
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-500/20 dark:to-yellow-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-200/50 dark:shadow-amber-500/20">
                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">360-Degree Feedback</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Team members can provide constructive feedback on collaboration, quality, 
                  and communication after completing projects together.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-200/50 dark:shadow-cyan-500/20">
                <Award className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Collaboration Scores</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Aggregate scores from peer reviews create a transparent view of each team 
                  member's contributions and strengths.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-500/20 dark:to-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200/50 dark:shadow-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Growth Tracking</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Monitor individual and team progress over time. Identify skill development 
                  opportunities and celebrate improvements.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-500/20 dark:to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200/50 dark:shadow-violet-500/20">
                <Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Recognition System</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Publicly acknowledge great work with badges and achievements. Foster a 
                  positive culture where excellence is celebrated.
                </p>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-amber-50/80 via-peach-50/80 to-rose-50/80 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-rose-500/20 rounded-3xl shadow-lg shadow-amber-200/30 dark:shadow-amber-500/30 border-amber-200/50 dark:border-amber-400/30">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-400 dark:from-amber-500/60 dark:to-orange-600/60 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-300/50 dark:shadow-amber-500/30">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">Transparent Performance</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  Build trust and accountability with fair, structured peer reviews that 
                  highlight everyone's contributions.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/80 dark:bg-slate-700/50 rounded-xl p-3 shadow-sm shadow-amber-200/50 dark:shadow-none">
                    <div className="text-slate-900 dark:text-slate-100 text-2xl mb-1">95%</div>
                    <p className="text-slate-600 dark:text-slate-400">Engagement</p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-700/50 rounded-xl p-3 shadow-sm shadow-amber-200/50 dark:shadow-none">
                    <div className="text-slate-900 dark:text-slate-100 text-2xl mb-1">4.8</div>
                    <p className="text-slate-600 dark:text-slate-400">Avg Rating</p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-700/50 rounded-xl p-3 shadow-sm shadow-amber-200/50 dark:shadow-none">
                    <div className="text-slate-900 dark:text-slate-100 text-2xl mb-1">500+</div>
                    <p className="text-slate-600 dark:text-slate-400">Reviews</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-24 text-center"
        >
          <Card className="p-12 bg-gradient-to-br from-slate-800 to-indigo-900 dark:from-slate-700/80 dark:to-indigo-800/80 rounded-3xl shadow-2xl shadow-indigo-300/30 dark:shadow-indigo-500/30 border-0 max-w-4xl mx-auto">
            <h2 className="text-white text-4xl mb-4">Ready to Transform Your Team?</h2>
            <p className="text-blue-100 dark:text-cyan-200 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of teams using AI-powered collaboration to work smarter, 
              deliver faster, and build better together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8 shadow-lg shadow-white/20">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                Schedule Demo
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
