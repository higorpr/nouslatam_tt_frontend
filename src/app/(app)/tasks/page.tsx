"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { Task } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { TaskCard } from "@/components/task-card";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, taskUpdateTrigger } = useAuth();

  // State to manage the confirmation dialog
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Function to fetch tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/tasks/");
      setTasks(response.data.results);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tasks when the component mounts, user auth changes or tasks are modified
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, fetchTasks, taskUpdateTrigger]);

  // Function to handle the actual deletion via API
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await api.delete(`/tasks/${taskToDelete.id}/`);

      // Fetch tasks again to update the UI
      await fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      // Close the confirmation dialog
      setTaskToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading your tasks...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <TaskFormDialog onTaskSaved={fetchTasks}>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </TaskFormDialog>
      </header>

      {tasks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map((task) => (
            // Pass a function to onDelete that opens the confirmation dialog
            <TaskCard
              key={task.id}
              task={task}
              onTaskSaved={fetchTasks}
              onDelete={() => setTaskToDelete(task)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            You do not have any tasks yet.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Click Crete Task to get started.
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={() => setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task {taskToDelete?.title}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
