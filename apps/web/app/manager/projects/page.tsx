"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { useAuth } from "@/lib/auth-context"
import { apiFetch, ApiError } from "@/lib/api"

type ProjectStatus = "active" | "on_hold" | "completed"

type Project = {
  _id: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
}

const STATUS_VARIANT: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  on_hold: "secondary",
  completed: "outline",
}

const emptyForm = { name: "", description: "", status: "active" as ProjectStatus }

export default function ProjectsPage() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  async function loadProjects() {
    if (!token) return
    try {
      const res = await apiFetch<{ projects: Project[] }>("/projects", { token })
      setProjects(res.projects)
    } catch {
      toast.error("Failed to load projects")
    }
  }

  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function startEdit(project: Project) {
    setEditingId(project._id)
    setForm({ name: project.name, description: project.description, status: project.status })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setIsSubmitting(true)

    try {
      if (editingId) {
        await apiFetch(`/projects/${editingId}`, { method: "PUT", token, body: form })
        toast.success("Project updated")
      } else {
        await apiFetch("/projects", { method: "POST", token, body: form })
        toast.success("Project created")
      }
      cancelEdit()
      await loadProjects()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return
    try {
      await apiFetch(`/projects/${deleteTarget._id}`, { method: "DELETE", token })
      toast.success("Project deleted")
      if (editingId === deleteTarget._id) cancelEdit()
      setDeleteTarget(null)
      await loadProjects()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete project"
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground">Create and manage the projects your team reports against.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{editingId ? "Edit project" : "New project"}</CardTitle>
            <CardDescription>
              {editingId ? "Update the project details below." : "Add a project for your team to report on."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}
              >
                <SelectTrigger id="status" className="w-full sm:w-48">
                  <SelectValue>
                    {(value: ProjectStatus) => STATUS_LABEL[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {editingId ? "Save changes" : "Create project"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects === null ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet. Create one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-muted-foreground">{project.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[project.status]}>
                        {STATUS_LABEL[project.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(project)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(project)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot;. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
