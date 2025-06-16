"use client";

import { useState, useEffect, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { Button } from "./ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

// If task is sent = Edition Mode
// Else = Creation Mode
interface TaskFormDialogProps {
  children: ReactNode;
  task?: Task;
  onTaskSaved?: () => void;
}

export function TaskFormDialog({ children, task }: TaskFormDialogProps) {
  // Form control and task creation/edition states
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("PENDING");
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const [isLoading, setIsLoading] = useState(false);
  const { triggerTaskUpdate } = useAuth();

  // 2. Fills form if in edition mode
  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    }
  }, [task, open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const payload = {
      title,
      description,
      status,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
    };

    try {
      if (task) {
        // Edit mode = patch request
        await api.patch(`/tasks/${task.id}/`, payload);
      } else {
        // Creation mode = post request
        await api.post("/tasks/", payload);
      }

      setOpen(false); // Close Dialog
      // Trigger task page update
      triggerTaskUpdate();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reseta o formulário quando o dialog é fechado
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setStatus("PENDING");
      setDueDate(undefined);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* Title is defined by presence of task */}
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Edit the details of your task."
              : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Add a description (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value: Task["status"]) => setStatus(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due-date" className="text-right">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
