"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats, Quote } from "@/types";

import { SectionCards } from "@/components/section-cards";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, taskUpdateTrigger } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Usamos Promise.all para buscar os dois endpoints ao mesmo tempo
      const [statsResponse, quoteResponse] = await Promise.all([
        api.get("/tasks/dashboard/"),
        api.get("/quotes/"),
        api.get("/tasks/"),
      ]);
      setStats(statsResponse.data);
      setQuote(quoteResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData, taskUpdateTrigger]);

  // Se estiver carregando, mostramos um layout de "esqueleto"
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[110px] w-full" />
          <Skeleton className="h-[110px] w-full" />
          <Skeleton className="h-[110px] w-full" />
          <Skeleton className="h-[110px] w-full" />
        </div>
        <Skeleton className="h-12 w-1/3" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Passamos os dados buscados para o componente de cards */}
        <SectionCards stats={stats} />

        {/* Exibimos a frase motivacional */}
        {quote && (
          <div className="px-4 lg:px-6">
            <blockquote className="mt-6 border-l-2 pl-6 italic">
              &ldquo;{quote.quote}&ldquo;
              <footer className="mt-2 text-sm">- {quote.author}</footer>
            </blockquote>
          </div>
        )}

        {/* <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div> */}
      </div>
    </div>
  );
}
