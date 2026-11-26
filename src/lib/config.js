import { supabase } from "./supabase.js";

export async function loadEstimatorConfig() {
  const { data, error } = await supabase.from("optical_store_config").select("*").eq("id", 1).single();
  if (error) throw new Error(error.message);
  return data;
}
