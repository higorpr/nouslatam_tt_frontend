'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Check, Archive, ListTodo } from "lucide-react";
import { DashboardStats } from "@/types";

// interface to receive the stats from the backend
interface SectionCardsProps {
  stats: DashboardStats | null;
}

export function SectionCards({ stats }: SectionCardsProps) {
  // If data is not loaded, renders nothing
  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_tasks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <Check className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed_tasks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending_tasks}</div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Archived Tasks</CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.archived_tasks}</div>
        </CardContent>
      </Card>
    </div>
  );
}
