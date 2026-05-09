import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Table =
  | "camp_managers" | "accounts" | "disaster_types"
  | "camps" | "supplies" | "alerts" | "distributions";

export function useList<T = any>(table: Table, orderBy = "created_at") {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order(orderBy, { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useInsert(table: Table) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      const { error, data } = await supabase.from(table).insert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Created");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to create"),
  });
}

export function useUpdate(table: Table) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...row }: any) => {
      const { error, data } = await supabase.from(table).update(row).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Updated");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update"),
  });
}

export function useRemove(table: Table) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Deleted");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to delete"),
  });
}
