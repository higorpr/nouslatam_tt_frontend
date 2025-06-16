// Interface to receive tasks from the backend
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "PENDING" | "COMPLETED" | "ARCHIVED";
  due_date: string | null;
  created_at: string;
  updated_at: string;
  owner: string;
}

// Interface to dashboad info from the backend
export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  archived_tasks: number;
}

// Interface to quotes from the backend
export interface Quote {
  quote: string;
  author: string;
}
