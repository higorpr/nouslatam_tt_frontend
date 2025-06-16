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
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  // Define Barge color based on task status
  const statusToVariantMap: Record<Task["status"], BadgeVariant> = {
    PENDING: "secondary",
    COMPLETED: "default",
    ARCHIVED: "outline",
  };

  const variant = statusToVariantMap[task.status];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>
          {task.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant={variant}>{task.status}</Badge>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Due Date:{" "}
          {task.due_date
            ? new Date(task.due_date).toLocaleDateString("pt-BR")
            : "N/A"}
        </p>
      </CardFooter>
    </Card>
  );
}
