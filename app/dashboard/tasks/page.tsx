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
import { useUserTasks } from '@/hooks/data/useUserTasks'
import { useAuth } from '@/hooks/useAuth'
import { Task } from '@/lib/types'
import { db } from '@/firebaseConfig'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'

export default function MyTasksPage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { tasks: allTasks, loading } = useUserTasks(currentUser?.uid)

  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredTasks = useMemo(() => {
    let tasks: Task[] = [...allTasks]
    if (projectFilter) {
      tasks = tasks.filter((t) =>
        (t.name || '').toLowerCase().includes(projectFilter.toLowerCase())
      )
    }
    if (statusFilter !== 'all') {
      tasks = tasks.filter((t) => t.status === statusFilter)
    }
    tasks.sort((a, b) => {
      const dateA = a.deadline ? (a.deadline as Timestamp).toMillis() : Infinity
      const dateB = b.deadline ? (b.deadline as Timestamp).toMillis() : Infinity
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })
    return tasks
  }, [allTasks, projectFilter, statusFilter, sortOrder])

  const toggleStatus = async (task: Task) => {
    let newStatus: Task['status'] = 'todo'
    if (task.status === 'todo') {
      newStatus = 'inProgress'
    } else if (task.status === 'inProgress') {
      newStatus = 'done'
    } else if (task.status === 'done') {
      newStatus = 'todo'
    }

    if (!task.projectId) {
      console.error("Cannot update task: projectId is missing.", task)
      return
    }
    const taskRef = doc(db, 'projects', task.projectId, 'tasks', task.id)

    try {
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
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-black">My Tasks</h1>

      {/* Styled Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Filter by project..."
          className="max-w-xs bg-white border-2 border-black rounded-lg placeholder:text-gray-500"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-white border-2 border-black rounded-lg">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 border-black rounded-lg">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="flex items-center gap-1 bg-white border-2 border-black rounded-lg text-black hover:bg-gray-100"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowDownUp size={16} />
          Deadline ({sortOrder === 'asc' ? 'Soonest' : 'Latest'})
        </Button>
      </div>

      {/* Styled Card */}
      <Card className="bg-white border-2 border-black rounded-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Styled Table Head */}
              <thead className="bg-gray-50 border-b-2 border-black">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-black w-1/12">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-black w-4/12">
                    Task
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-black w-3/12">
                    Project
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-black w-2/12">
                    Deadline
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-black w-2/12">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-600">
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
                      // Styled Table Row
                      <tr key={task.id} className="hover:bg-gray-50">
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
                              <Circle size={20} className="text-gray-500" />
                            )}
                          </button>
                        </td>
                        <td
                          className={`p-4 font-medium ${
                            task.status === 'done'
                              ? 'line-through text-gray-500'
                              : 'text-black'
                          }`}
                        >
                          {task.title}
                        </td>
                        <td className="p-4 text-gray-700">
                          {task.name}
                        </td>
                        <td
                          className={`p-4 text-sm ${
                            isOverdue
                              ? 'text-red-600 font-semibold'
                              : 'text-gray-700'
                          }`}
                        >
                          {deadlineDate
                            ? deadlineDate.toLocaleDateString()
                            : 'No deadline'}
                        </td>
                        <td className="p-4">
                          {/* Styled Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-2 border-black rounded-lg text-black hover:bg-gray-100"
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