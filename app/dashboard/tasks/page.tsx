'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Filter,
  Calendar,
  CheckCircle,
  Radio,
  Loader2,
  Circle,
  ArrowDownUp,
} from 'lucide-react'
// --- 1. Import your hook and the Task type ---
import { useUserTasks } from '@/hooks/data/useUserTasks'
import { useAuth } from '@/hooks/useAuth'
import { Task } from '@/lib/types' // Assuming Task type is here
import { db } from '@/firebaseConfig'
import { doc, updateDoc, Timestamp } from 'firebase/firestore' // Import Timestamp

export default function MyTasksPage() {
  const router = useRouter()
  // --- 2. Use your hook ---
  const { currentUser } = useAuth()
  const { tasks: allTasks, loading } = useUserTasks(currentUser?.uid)

  // Filter and Sort State
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'todo', 'inProgress', 'done'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Memoized list to prevent re-filtering on every render
  const filteredTasks = useMemo(() => {
    let tasks: Task[] = [...allTasks]

    // 1. Filter by Project
    if (projectFilter) {
      tasks = tasks.filter((t) =>
        t.name.toLowerCase().includes(projectFilter.toLowerCase())
      )
    }

    // 2. Filter by Status
    if (statusFilter !== 'all') {
      tasks = tasks.filter((t) => t.status === statusFilter)
    }

    // 3. Sort by Deadline
    tasks.sort((a, b) => {
      // Ensure we handle Timestamp or null
      const dateA = a.deadline ? (a.deadline as Timestamp).toMillis() : Infinity
      const dateB = b.deadline ? (b.deadline as Timestamp).toMillis() : Infinity
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    return tasks
  }, [allTasks, projectFilter, statusFilter, sortOrder])

  // Update Firestore when status is toggled
  const toggleStatus = async (task: Task) => {
    // Cycle through statuses: todo -> inProgress -> done -> todo
    let newStatus: Task['status'] = 'todo'
    if (task.status === 'todo') {
      newStatus = 'inProgress'
    } else if (task.status === 'inProgress') {
      newStatus = 'done'
    } else if (task.status === 'done') {
      newStatus = 'todo'
    }

    // Path to the task document: /projects/{projectId}/tasks/{taskId}
    // Your hook correctly provides task.projectId
    if (!task.projectId) {
      console.error("Cannot update task: projectId is missing.", task)
      return
    }
    const taskRef = doc(db, 'projects', task.projectId, 'tasks', task.id)

    try {
      // Your security rules allow the assignee to update the status
      await updateDoc(taskRef, {
        status: newStatus,
      })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const today = new Date()

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">My Tasks</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Filter by project..."
          className="max-w-xs"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowDownUp size={16} />
          Deadline ({sortOrder === 'asc' ? 'Soonest' : 'Latest'})
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-muted-foreground w-1/12">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-muted-foreground w-4/12">
                    Task
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-muted-foreground w-3/12">
                    Project
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-muted-foreground w-2/12">
                    Deadline
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-muted-foreground w-2/12">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const deadlineDate = task.deadline ? (task.deadline as Timestamp).toDate() : null
                    const isOverdue =
                      deadlineDate &&
                      deadlineDate < today &&
                      task.status !== 'done'

                    return (
                      <tr key={task.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <button
                            onClick={() => toggleStatus(task)}
                            title={`Click to change status (current: ${task.status})`}
                          >
                            {task.status === 'done' ? (
                              <CheckCircle size={20} className="text-green-500" />
                            ) : task.status === 'inProgress' ? (
                              <Radio size={20} className="text-blue-500" />
                            ) : (
                              <Circle size={20} className="text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td
                          className={`p-4 font-medium ${
                            task.status === 'done'
                              ? 'line-through text-muted-foreground'
                              : ''
                          }`}
                        >
                          {task.title}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {task.name}
                        </td>
                        <td
                          className={`p-4 text-sm ${
                            isOverdue
                              ? 'text-red-600 font-semibold'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {deadlineDate
                            ? deadlineDate.toLocaleDateString()
                            : 'No deadline'}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/projects/${task.projectId}`)
                            }
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}