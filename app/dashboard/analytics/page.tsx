'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend, // <-- Import Legend
} from 'recharts'
import {
  Activity,
  TrendingUp,
  Loader2,
  AlertTriangle,
  CalendarCheck,
} from 'lucide-react'

// --- Import Real Hooks & Types ---
import { useAuth } from '@/hooks/useAuth'
import { useAllProjectTasks } from '@/hooks/data/useAllProjectTasks'
import { useUserDirectory } from '@/hooks/data/useUserDirectory' // <-- Added back
import { Task, UserProfile } from '@/lib/types' // <-- Added UserProfile
import { Timestamp } from 'firebase/firestore'

// Helper to format dates
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// --- Workload Scoring Logic (no changes) ---
const calculateWorkloadScore = (task: Task, today: Date): number => {
  if (task.status === 'done') {
    return 0
  }
  if (!task.deadline) {
    return 1
  }
  const deadline = (task.deadline as Timestamp).toDate()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 20
  if (diffDays <= 2) return 15
  if (diffDays <= 7) return 10
  if (diffDays <= 30) return 5
  return 2
}

// --- Helper to generate colors for users ---
const FADE_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908',
  '#d0ed57', '#a4de6c', '#8dd1e1', '#83a6ed', '#844d00'
];
let colorIndex = 0;
const userColorMap = new Map<string, string>();
const getUserColor = (userId: string) => {
  if (!userColorMap.has(userId)) {
    userColorMap.set(userId, FADE_COLORS[colorIndex % FADE_COLORS.length]);
    colorIndex++;
  }
  return userColorMap.get(userId)!;
};

export default function AnalyticsPage() {
  const router = useRouter()
  const { currentUser } = useAuth()

  // --- Use new hooks ---
  const { allTasks, loading: tasksLoading } = useAllProjectTasks(currentUser?.uid)
  const { users, loading: usersLoading } = useUserDirectory() // <-- Added back
  const loading = tasksLoading || usersLoading

  // --- Memoized Data Processing ---
  const analyticsData = useMemo(() => {
    if (!allTasks || allTasks.length === 0 || !currentUser || !users) {
      return {
        activeProjects: 0,
        myActiveTasks: 0,
        myOverdueTasksCount: 0,
        myDueThisWeekTasks: [],
        stackedProjectWorkloadData: [],
        allUserIdsInChart: [],
        projectWithMostWorkload: null,
        projectWithMostOverdue: null,
      }
    }

    const today = new Date()
    const todayAtMidnight = new Date(today.setHours(0, 0, 0, 0))
    const nextWeek = new Date(todayAtMidnight)
    nextWeek.setDate(todayAtMidnight.getDate() + 7)

    // 1. Get stats for the CURRENT USER (for summary cards)
    const myTasks = allTasks.filter(
      (t) => t.assignedTo === currentUser.uid
    )
    const myActiveTasks = myTasks.filter((t) => t.status !== 'done')

    const myOverdueTasks = myActiveTasks.filter(
      (t) => t.deadline && (t.deadline as Timestamp).toDate() < todayAtMidnight
    )

    const myDueThisWeekTasks = myActiveTasks
      .filter((t) => {
        if (!t.deadline) return false
        const deadLineDate = (t.deadline as Timestamp).toDate()
        return deadLineDate >= todayAtMidnight && deadLineDate <= nextWeek
      })
      .sort(
        (a, b) =>
          (a.deadline as Timestamp).toMillis() -
          (b.deadline as Timestamp).toMillis()
      )

    const activeProjects = [
      ...new Set(myActiveTasks.map((t) => t.projectId)),
    ].length

    // 2. Calculate comparative workload for STACKED BAR CHART
    const allUserIdsInChart = new Set<string>()
    const projectStats = allTasks.reduce((acc, task) => {
      const score = calculateWorkloadScore(task, todayAtMidnight)
      if (score === 0) return acc; // Don't process done tasks

      const name = task.name || 'Unknown Project'
      const userId = task.assignedTo

      allUserIdsInChart.add(userId)

      if (!acc[name]) {
        acc[name] = { name }
      }
      if (!acc[name][userId]) {
        acc[name][userId] = 0
      }

      acc[name][userId] += score

      // Also track overdue for suggestions
      const isOverdue =
        task.deadline &&
        (task.deadline as Timestamp).toDate() < todayAtMidnight
      if (isOverdue) {
        if (!acc[name].overdueCount) {
          acc[name].overdueCount = 0
        }
        acc[name].overdueCount += 1
      }

      return acc
    }, {} as Record<string, any>)

    const stackedProjectWorkloadData = Object.values(projectStats).sort(
      (a, b) => {
        const scoreA = Object.keys(a).filter(k => k !== 'name' && k !== 'overdueCount').reduce((sum, key) => sum + a[key], 0);
        const scoreB = Object.keys(b).filter(k => k !== 'name' && k !== 'overdueCount').reduce((sum, key) => sum + b[key], 0);
        return scoreB - scoreA;
      }
    );

    // --- Data for Suggestions ---
    const projectOverdueData = Object.values(projectStats)
      .map(p => ({
        name: p.name,
        overdueCount: p.overdueCount || 0
      }))
      .sort((a, b) => b.overdueCount - a.overdueCount)

    const projectWithMostWorkload = stackedProjectWorkloadData[0] || null
    const projectWithMostOverdue =
      projectOverdueData[0] && projectOverdueData[0].overdueCount > 0
        ? projectOverdueData[0]
        : null

    return {
      activeProjects,
      myActiveTasks: myActiveTasks.length,
      myOverdueTasksCount: myOverdueTasks.length,
      myDueThisWeekTasks,
      stackedProjectWorkloadData,
      allUserIdsInChart: Array.from(allUserIdsInChart),
      projectWithMostWorkload,
      projectWithMostOverdue,
    }
  }, [allTasks, currentUser, users]) // Added users dependency

  // Destructure for easier use
  const {
    activeProjects,
    myActiveTasks,
    myOverdueTasksCount,
    myDueThisWeekTasks,
    stackedProjectWorkloadData,
    allUserIdsInChart,
    projectWithMostWorkload,
    projectWithMostOverdue,
  } = analyticsData

  // Helper to get user display name for Legend
  const getUserName = (userId: string) => {
    if (userId === currentUser?.uid) return "You";
    return users?.find(u => u.id === userId)?.displayName || userId.substring(0, 5) + '...';
  }


  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* ===== Header ===== */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">
          Well-being & Workload Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Insights about your personal tasks and project intensity.
        </p>
      </div>

      {/* ===== Summary Cards (Personal Stats) ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-start">
          <Activity className="text-blue-500 mb-2" size={20} />
          <CardTitle className="text-sm text-muted-foreground">
            Active Projects
          </CardTitle>
          <p className="text-xl font-bold">{activeProjects}</p>
        </Card>

        <Card className="p-4 flex flex-col items-start">
          <TrendingUp className="text-green-500 mb-2" size={20} />
          <CardTitle className="text-sm text-muted-foreground">
            Your Active Tasks
          </CardTitle>
          <p className="text-xl font-bold">{myActiveTasks}</p>
        </Card>

        <Card className="p-4 flex flex-col items-start">
          <AlertTriangle className="text-red-500 mb-2" size={20} />
          <CardTitle className="text-sm text-muted-foreground">
            Your Overdue Tasks
          </CardTitle>
          <p className="text-xl font-bold">{myOverdueTasksCount}</p>
        </Card>

        <Card className="p-4 flex flex-col items-start">
          <CalendarCheck className="text-orange-500 mb-2" size={20} />
          <CardTitle className="text-sm text-muted-foreground">
            Your Due This Week
          </CardTitle>
          <p className="text-xl font-bold">{myDueThisWeekTasks.length}</p>
        </Card>
      </div>

      {/* ===== MODIFIED: Project Workload Distribution (Stacked) ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Project Workload Distribution</CardTitle>
          <p className="text-sm text-muted-foreground pt-1">
            Overall project intensity based on all member tasks and deadlines.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {stackedProjectWorkloadData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No workload data to display.
              </div>
            ) : (
              <BarChart data={stackedProjectWorkloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend formatter={(value, entry) => getUserName(value as string)} />
                {allUserIdsInChart.map((userId) => (
                  <Bar
                    key={userId}
                    dataKey={userId}
                    stackId="a" // This groups them into a stack
                    name={getUserName(userId)} // Name for tooltip
                    fill={getUserColor(userId)} // Assign color
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          {projectWithMostWorkload ? (
            <>
              <b>{projectWithMostWorkload.name}</b> currently has the
              highest workload.
            </>
          ) : (
            'No active projects to analyze.'
          )}
        </CardFooter>
      </Card>

      {/* ===== Focus Suggestions (Project-Based) ===== */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>Focus & Priority Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {myActiveTasks > 0 ? (
            <>
              {myOverdueTasksCount > 0 && (
                <p>
                  • You have <b>{myOverdueTasksCount} overdue task(s)</b>. Try to
                  clear those first to reduce stress.
                </p>
              )}
              {projectWithMostOverdue && (
                <p>
                  • Project <b>{projectWithMostOverdue.name}</b> has the
                  most overdue tasks ({projectWithMostOverdue.overdueCount}).
                  Check in with the team.
                </p>
              )}
              {projectWithMostWorkload &&
                projectWithMostWorkload.name !==
                  projectWithMostOverdue?.name && (
                  <p>
                    • Project <b>{projectWithMostWorkload.name}</b> has
                    the highest upcoming workload. Plan accordingly.
                  </p>
                )}
            </>
          ) : (
            <p className="text-muted-foreground">
              No suggestions available. Enjoy the calm!
            </p>
          )}
        </CardContent>
      </Card>

      {/* ===== Upcoming Deadlines (Personal Stats) ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {myDueThisWeekTasks.length === 0 ? (
            <p className="text-muted-foreground">
              No tasks due in the next 7 days.
            </p>
          ) : (
            <ul className="space-y-3">
              {myDueThisWeekTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md hover:bg-muted/50 border"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600 mt-2 sm:mt-0">
                    Due: {formatDate((task.deadline as Timestamp).toDate())}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ===== Action Panel ===== */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/tasks')}
        >
          View Task Summary
        </Button>
        <Button variant="default" disabled>
          Start Focus Session (WIP)
        </Button>
      </div>
    </div>
  )
}