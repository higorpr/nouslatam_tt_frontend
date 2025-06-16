"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface to to receive functions from parent component
interface TaskFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function TaskFilters({
  searchValue,
  onSearchChange,
  onStatusChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
      <Input
        placeholder="Search tasks by title or description"
        className="max-w-sm"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        onValueChange={(value) => onStatusChange(value === "ALL" ? "" : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="ARCHIVED">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
