"use client"

import { useState } from "react"
import { CalendarDays, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react"

import { TaskEditDialog } from "@/components/tasks/task-edit-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { deleteTask, toggleTaskStatus } from "@/lib/tasks"
import type { Task, TaskPriority, TaskStatus } from "@/lib/types/task"
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/types/task"

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  medium: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  high: "bg-red-500/15 text-red-600 dark:text-red-400",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
  })
}

type TaskItemProps = {
  task: Task
  onChanged: () => void
}

export function TaskItem({ task, onChanged }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isCompleted = task.status === "completed"

  const handleToggle = async () => {
    setIsToggling(true)
    const { error } = await toggleTaskStatus(task)
    setIsToggling(false)
    if (!error) onChanged()
  }

  const handleDelete = async () => {
    setDeleteError(null)
    setIsDeleting(true)
    const { error } = await deleteTask(task.id)
    setIsDeleting(false)

    if (error) {
      setDeleteError(error)
      return
    }

    setShowDeleteConfirm(false)
    onChanged()
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50">
        <Checkbox
          checked={isCompleted}
          disabled={isToggling}
          onCheckedChange={handleToggle}
          aria-label={isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
        />
        <div className="flex flex-1 flex-col gap-0.5">
          <span
            className={cn(
              "text-sm font-medium",
              isCompleted && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[task.status])}>
              {TASK_STATUS_LABELS[task.status]}
            </Badge>
            <Badge variant="secondary" className={cn("text-[10px]", PRIORITY_COLORS[task.priority])}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>
            {task.due_date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3" />
                {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleToggle()}
              disabled={isToggling}
            >
              {isCompleted ? "Marcar pendiente" : "Marcar completada"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowEdit(true)}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TaskEditDialog
        task={task}
        open={showEdit}
        onOpenChange={setShowEdit}
        onTaskUpdated={onChanged}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar tarea</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar <strong>{task.title}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
