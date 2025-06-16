"use client";
import { Task } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import { Button } from "./ui/button";
import { MoreHorizontal } from "lucide-react";
import { TaskFormDialog } from "./task-form-dialog";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: number) => void;
  onTaskSaved: () => void;
}

export function TaskCard({ task, onDelete, onTaskSaved }: TaskCardProps) {
  // Define Badge color based on task status
  const statusToVariantMap: Record<Task["status"], BadgeVariant> = {
    PENDING: "secondary",
    COMPLETED: "default",
    ARCHIVED: "outline",
  };

  const variant = statusToVariantMap[task.status];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>
            {task.description || "This task has no description."}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <TaskFormDialog task={task} onTaskSaved={onTaskSaved}>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                }}
              >
                Edit
              </DropdownMenuItem>
            </TaskFormDialog>
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 cursor-pointer"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Badge variant={variant}>{task.status}</Badge>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Due by:{" "}
          {task.due_date
            ? new Date(task.due_date).toLocaleDateString("en-US")
            : "No due date"}
        </p>
      </CardFooter>
    </Card>
  );
}
