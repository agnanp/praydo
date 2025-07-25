import { invoke } from "@tauri-apps/api/core";

export async function getEnv(name: string): Promise<string> {
  return await invoke("get_env", { name });
}
