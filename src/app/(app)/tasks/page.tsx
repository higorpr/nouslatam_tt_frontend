// src/app/(app)/tasks/page.tsx
'use client';

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Task } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { TaskCard } from "@/components/task-card"; // Importamos nosso novo componente

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Só busca as tarefas se o usuário estiver autenticado
    if (isAuthenticated) {
      const fetchTasks = async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/tasks/');
          // A API do DRF com paginação retorna os dados dentro da chave 'results'
          setTasks(response.data.results);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTasks();
    }
  }, [isAuthenticated]); // Roda o efeito sempre que o status de autenticação mudar

  if (isLoading) {
    return <div className="p-6">Loading Tasks...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
      </header>

      {tasks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">You still do not have any tasks</p>
          <p className="text-sm text-muted-foreground mt-2">Start by clicking on Create Task button (Menu)</p>
        </div>
      )}
    </div>
  );
}