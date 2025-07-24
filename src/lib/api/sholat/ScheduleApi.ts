import { fetch } from "@tauri-apps/plugin-http";
import { getEnv } from "../../env";

export const dailySchedule = async (cityId: string[], date: string) => {
  
    let url: string = await getEnv("SHOLAT_SCHEDULE_URL");
    url = `${url}/${cityId}/${date}`;
    
    return await fetch(url, {
        method: "GET",
        headers: {
        "Accept": "application/json",
        },
    });
};