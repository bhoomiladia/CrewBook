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
  Legend,
} from 'recharts'
import {
  Activity,
  TrendingUp,
  Loader2,
  AlertTriangle,
  CalendarCheck,
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useAllProjectTasks } from '@/hooks/data/useAllProjectTasks'
import { useUserDirectory } from '@/hooks/data/useUserDirectory'
// FIX 1: Add this import back - YOU MUST FIX THIS PATH
import { useAllProjects } from '@/hooks/data/useAllProjects' 
// FIX 2: Add Project type back
import { Task, UserProfile, Project, UserProfileWithId } from '@/lib/types' 
import { Timestamp } from 'firebase/firestore'

// --- KEPT ALL LOCAL LOGIC ---
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const calculateWorkloadScore = (task: Task, today: Date, users: UserProfileWithId[]): number => {
  if (task.status === 'done') return 0;
  const assignedUser = users.find(u => u.id === task.assignedTo);
  const workloadMultiplier = assignedUser?.workloadStatus === 'heavy' ? 1.5 : 1;
  if (!task.deadline) return 1 * workloadMultiplier;
  const deadline = (task.deadline as Timestamp).toDate();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let score = 0;
  if (diffDays < 0) score = 20;
  else if (diffDays <= 2) score = 15;
  else if (diffDays <= 7) score = 10;
  else if (diffDays <= 30) score = 5;
  else score = 2;
  return score * workloadMultiplier;
}

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
  const { currentUser, userProfile } = useAuth()

  const { allTasks, loading: tasksLoading } = useAllProjectTasks(currentUser?.uid)
  const { users, loading: usersLoading } = useUserDirectory()
  // FIX 3: Add this hook back
  const { projects, loading: projectsLoading } = useAllProjects(currentUser?.uid)

  // FIX 4: Add projectsLoading back
  const loading = tasksLoading || usersLoading || projectsLoading;

  const analyticsData = useMemo(() => {
    // FIX 5: Add !projects back to the guard clause
    if (loading || !currentUser || !users || !projects || !allTasks) {
      return { activeProjects: 0, myActiveTasks: 0, myOverdueTasksCount: 0, myDueThisWeekTasks: [], stackedProjectWorkloadData: [], allUserIdsInChart: [], projectWithMostWorkload: null, projectWithMostOverdue: null }
    }
    
    // FIX 6: Restore projectMap to get names
    const projectMap = new Map<string, Project>(projects.map((p: Project) => [p.id, p]));
    
    // FIX 7: Restore name logic using the projectMap
    const tasksWithProjectNames = allTasks.map((task: Task) => ({ 
      ...task, 
      name: projectMap.get(task.projectId)?.name ?? 'Unknown Project' 
    }));
    
    const today = new Date();
    const todayAtMidnight = new Date(today.setHours(0, 0, 0, 0));
    const nextWeek = new Date(todayAtMidnight);
    nextWeek.setDate(todayAtMidnight.getDate() + 7);

    const myTasks = tasksWithProjectNames.filter((t) => t.assignedTo === currentUser!.uid);
    
    const myActiveTasks = myTasks.filter((t) => t.status !== 'done');
    const myOverdueTasks = myActiveTasks.filter((t) => t.deadline && (t.deadline as Timestamp).toDate() < todayAtMidnight);
    const myDueThisWeekTasks = myActiveTasks.filter((t) => { if (!t.deadline) return false; const deadLineDate = (t.deadline as Timestamp).toDate(); return deadLineDate >= todayAtMidnight && deadLineDate <= nextWeek; }).sort((a, b) => (a.deadline as Timestamp).toMillis() - (b.deadline as Timestamp).toMillis());
    const activeProjects = [...new Set(myActiveTasks.map((t) => t.projectId))].length;
    const allUserIdsInChart = new Set<string>();
    
    const projectStats = tasksWithProjectNames.reduce((acc, task) => {
      // FIX 8: Restore project status check
      const project = projectMap.get(task.projectId);
      if (project?.status === 'onHold') return acc;
      
      const score = calculateWorkloadScore(task, todayAtMidnight, users);
      if (score === 0) return acc;
      
      const name = task.name; // This is now the real project name
      const userId = task.assignedTo === currentUser!.uid ? "You" : task.assignedTo;
      
      allUserIdsInChart.add(userId);
      if (!acc[name]) { acc[name] = { name } }
      if (!acc[name][userId]) { acc[name][userId] = 0 }
      acc[name][userId] += score;
      const isOverdue = task.deadline && (task.deadline as Timestamp).toDate() < todayAtMidnight;
      if (isOverdue) { if (!acc[name].overdueCount) { acc[name].overdueCount = 0 } acc[name].overdueCount += 1 }
      return acc;
    }, {} as Record<string, any>);
    
    const stackedProjectWorkloadData = Object.values(projectStats).sort((a, b) => { const scoreA = Object.keys(a).filter(k => k !== 'name' && k !== 'overdueCount').reduce((sum, key) => sum + a[key], 0); const scoreB = Object.keys(b).filter(k => k !== 'name' && k !== 'overdueCount').reduce((sum, key) => sum + b[key], 0); return scoreB - scoreA; });
    const projectOverdueData = Object.values(projectStats).map(p => ({ name: p.name, overdueCount: p.overdueCount ?? 0 })).sort((a, b) => b.overdueCount - a.overdueCount);
    const projectWithMostWorkload = stackedProjectWorkloadData[0] ?? null;
    const projectWithMostOverdue = projectOverdueData[0] && projectOverdueData[0].overdueCount > 0 ? projectOverdueData[0] : null;
    
    return { activeProjects, myActiveTasks: myActiveTasks.length, myOverdueTasksCount: myOverdueTasks.length, myDueThisWeekTasks, stackedProjectWorkloadData, allUserIdsInChart: Array.from(allUserIdsInChart), projectWithMostWorkload, projectWithMostOverdue };
  
  // FIX 9: Add 'projects' back to dependency array
  }, [allTasks, currentUser, users, projects, loading]);


  // Helper to get user display name for Legend
  const getUserName = (userId: string) => {
    if (userId === "You") return "You";
    return users?.find((u: UserProfileWithId) => u.id === userId)?.displayName ?? userId.substring(0, 5) + '...';
  }

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    )
  }

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
  
return (
    <div className="flex flex-col gap-6 p-0 md:p-4">
      {/* ===== Header ===== */}
      <div>
        <h1 className="text-2xl font-semibold mb-1 text-black">
          Well-being & Workload Analytics
        </h1>
        <p className="text-gray-600 text-sm">
          Your workload report, calculated from live data.
        </p>
      </div>

      {/* ===== Summary Cards (Personal Stats) ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-start bg-white border-2 border-black">
          <Activity className="text-blue-500 mb-2" size={20} />
          <CardTitle className="text-sm text-gray-600">
            Active Projects
          </CardTitle>
          <p className="text-xl font-bold text-black">{activeProjects}</p>
        </Card>
        <Card className="p-4 flex flex-col items-start bg-white border-2 border-black">
          <TrendingUp className="text-green-500 mb-2" size={20} />
          <CardTitle className="text-sm text-gray-600">
            Your Active Tasks
          </CardTitle>
          <p className="text-xl font-bold text-black">{myActiveTasks}</p>
        </Card>
        <Card className="p-4 flex flex-col items-start bg-white border-2 border-black">
          <AlertTriangle className="text-red-500 mb-2" size={20} />
          <CardTitle className="text-sm text-gray-600">
            Your Overdue Tasks
          </CardTitle>
          <p className="text-xl font-bold text-black">{myOverdueTasksCount}</p>
        </Card>
        <Card className="p-4 flex flex-col items-start bg-white border-2 border-black">
          <CalendarCheck className="text-orange-500 mb-2" size={20} />
          <CardTitle className="text-sm text-gray-600">
            Your Due This Week
          </CardTitle>
          <p className="text-xl font-bold text-black">{myDueThisWeekTasks.length}</p>
        </Card>
      </div>

      {/* ===== Project Workload Distribution (Stacked) ===== */}
      <Card className="bg-white border-2 border-black">
        <CardHeader>
          <CardTitle className="text-black">Project Workload Distribution</CardTitle>
          <p className="text-sm text-gray-600 pt-1">
            Overall project intensity based on all member tasks, deadlines, and user status.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {stackedProjectWorkloadData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No workload data to display.
              </div>
            ) : (
              <BarChart data={stackedProjectWorkloadData}>
                <CartesianGrid stroke="rgba(0, 0, 0, 0.1)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#000" tick={{ fill: '#000', fontSize: 12 }} />
                <YAxis stroke="#000" tick={{ fill: '#000', fontSize: 12 }} />
                <Tooltip 
                  wrapperStyle={{
                    border: '2px solid #000',
                    backgroundColor: '#fff',
                    boxShadow: '2px 2px 0px #000',
                    borderRadius: '0px',
                  }}
                  contentStyle={{ color: '#000' }}
                  labelStyle={{ color: '#000', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                />
                
                <Legend formatter={(value) => getUserName(value as string)} />
                
                {allUserIdsInChart.map((userId: string) => (
                  <Bar
                    key={userId}
                    dataKey={userId}
                    stackId="a"
                    name={getUserName(userId)}
                    fill={getUserColor(userId)}
                    stroke="#000"
                    strokeWidth={2}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="text-sm text-gray-600">
          {projectWithMostWorkload ? (
            <>
              {projectWithMostWorkload.name} currently has the highest workload.
            </>
          ) : (
            'No active projects to analyze.'
          )}
        </CardFooter>
      </Card>

      {/* --- Focus Suggestions --- */}
      <Card className="bg-white border-2 border-black border-dashed">
        <CardHeader>
          <CardTitle className="text-black">Focus & Priority Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
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
            <p className="text-gray-500">
              No suggestions available. Enjoy the calm!
            </p>
          )}
        </CardContent>
      </Card>

      {/* ===== Upcoming Deadlines (Personal Stats) ===== */}
      <Card className="bg-white border-2 border-black">
        <CardHeader>
          <CardTitle className="text-black">Your Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {myDueThisWeekTasks.length === 0 ? (
            <p className="text-gray-500">
              No tasks due in the next 7 days.
            </p>
          ) : (
            <ul className="space-y-3">
              {myDueThisWeekTasks.map((task: Task & { name: string }) => ( 
                <li
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border-2 border-black bg-white hover:bg-green-50"
                >
                  <div>
                    <p className="font-medium text-black">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      {task.name} {/* This will now show the Project Name */}
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

    </div>
  )
}