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
