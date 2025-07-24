import { fetch } from "@tauri-apps/plugin-http";
import { getEnv } from "../../env";

export const locationList = async () => {
  const url: string = await getEnv("SHOLAT_LOCATION_ALLCITY_URL");
  return await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });
};