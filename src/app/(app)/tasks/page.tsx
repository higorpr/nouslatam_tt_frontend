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
import { TaskFilters } from "@/components/task-filters";
import { Skeleton } from "@/components/ui/skeleton";

// Helper component for the loading state skeleton
const TaskGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-[180px] w-full rounded-lg" />
    ))}
  </div>
);

export default function TasksPage() {
  // States to control task list change, loading and filters
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // State to manage the confirmation dialog
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Auth user states
  const { isAuthenticated, taskUpdateTrigger } = useAuth();

  // Hook to add debouncing effect to user typing
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Delay of 500ms

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Function to fetch tasks with filters
  const fetchTasks = useCallback(async () => {
    // This now only sets loading to true when fetching
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await api.get(`/tasks/?${params.toString()}`);
      setTasks(response.data.results);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter]); // Resets function if filters change

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
      await api.delete(`/tasks/${taskToDelete.id}`);
      await fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setTaskToDelete(null);
    }
  };

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

      {/* Renders filter component with callback functions and the controlled value */}
      <TaskFilters
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
      />

      {/* Renders the skeleton only on the task grid area when loading */}
      {isLoading ? (
        <TaskGridSkeleton />
      ) : tasks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map((task) => (
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
            No tasks found for the current filters.
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
              task &rdquo;{taskToDelete?.title}&rdquo;.
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
