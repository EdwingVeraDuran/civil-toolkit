"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckSquare, Loader2, Plus } from "lucide-react"

import { TaskItem } from "@/components/tasks/task-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { createTask, getTasks } from "@/lib/tasks"
import type { Task } from "@/lib/types/task"

type TaskListProps = {
  projectId: string
  onTasksChanged?: (count: number) => void
  readOnly?: boolean
}

export function TaskList({
  projectId,
  onTasksChanged,
  readOnly = false,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshTasks = useCallback(async () => {
    const data = await getTasks(projectId)
    setTasks(data)
    onTasksChanged?.(data.length)
  }, [projectId, onTasksChanged])

  useEffect(() => {
    let cancelled = false
    void getTasks(projectId).then((data) => {
      if (!cancelled) {
        setTasks(data)
        setIsLoading(false)
        onTasksChanged?.(data.length)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const handleCreate = async () => {
    const title = newTitle.trim()
    if (!title) return

    setError(null)
    setIsCreating(true)
    const { error } = await createTask({ project_id: projectId, title })
    setIsCreating(false)

    if (error) {
      setError(error)
      return
    }

    setNewTitle("")
    void refreshTasks()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      void handleCreate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Input inline para crear */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una tarea y presiona Enter..."
            disabled={isCreating}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newTitle.trim() || isCreating}
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Lista de tareas */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
          <CheckSquare className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No hay tareas aún</p>
          <p className="text-xs text-muted-foreground">
            {readOnly
              ? "Las tareas y entregables del proyecto aparecerán aquí."
              : "Agrega la primera tarea usando el campo de arriba."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onChanged={refreshTasks}
              readOnly={readOnly}
              onError={setError}
            />
          ))}
        </div>
      )}
    </div>
  )
}
